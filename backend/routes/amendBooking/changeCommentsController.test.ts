import { Request, Response } from 'express'
import moment from 'moment'

import ChangeCommentsController from './changeCommentsController'
import BookingService from '../../services/bookingService'
import { BookingDetails } from '../../services/model'
import { DATE_TIME_FORMAT_SPEC } from '../../shared/dateHelpers'

jest.mock('../../services/bookingService')

describe('Change comments controller', () => {
  const bookingService = new BookingService(null, null, null) as jest.Mocked<BookingService>
  let controller: ChangeCommentsController
  const req = ({
    originalUrl: 'http://localhost',
    params: { agencyId: 'MDI', offenderNo: 'A12345', bookingId: 123 },
    session: { userDetails: { activeCaseLoadId: 'LEI', name: 'Bob Smith', username: 'BOB_SMITH' } },
    body: {},
    flash: jest.fn(),
  } as unknown) as jest.Mocked<Request>

  const res = ({
    locals: {},
    render: jest.fn(),
    redirect: jest.fn(),
  } as unknown) as jest.Mocked<Response>

  const bookingDetails: BookingDetails = {
    agencyId: 'WWI',
    videoBookingId: 123,
    courtLocation: 'City of London',
    dateDescription: '20 November 2020',
    date: moment('2020-11-20T00:00:00', DATE_TIME_FORMAT_SPEC, true),
    offenderNo: 'A123AA',
    prisonerName: 'John Doe',
    prisonName: 'some prison',
    prisonBookingId: 1,
    comments: 'some comment',
    preDetails: {
      prisonRoom: 'vcc room 2',
      startTime: '17:40',
      endTime: '18:00',
      description: 'vcc room 2 - 17:40 to 18:00',
      timings: '17:40 to 18:00',
    },
    mainDetails: {
      prisonRoom: 'vcc room 1',
      startTime: '18:00',
      endTime: '19:00',
      description: 'vcc room 1 - 18:00 to 19:00',
      timings: '18:00 to 19:00',
    },
    postDetails: {
      prisonRoom: 'vcc room 3',
      startTime: '17:40',
      endTime: '18:00',
      description: 'vcc room 3 - 19:00 to 19:20',
      timings: '19:00 to 19:20',
    },
  }

  beforeEach(() => {
    jest.resetAllMocks()
    controller = new ChangeCommentsController(bookingService)
  })

  describe('view', () => {
    const mockFlashState = ({ errors, input }) =>
      (req.flash as any).mockReturnValueOnce(errors).mockReturnValueOnce(input)

    describe('View page with no errors', () => {
      it('should display comment details', async () => {
        bookingService.get.mockResolvedValue(bookingDetails)
        mockFlashState({ errors: [], input: [] })

        await controller.view()(req, res, null)

        expect(res.render).toHaveBeenCalledWith('amendBooking/changeComments.njk', {
          bookingId: 123,
          formValues: {
            comments: 'some comment',
          },
          errors: [],
        })
      })
    })

    describe('View page with errors present', () => {
      it('should display validation for errors', async () => {
        bookingService.get.mockResolvedValue(bookingDetails)
        mockFlashState({
          errors: [{ text: 'error message', href: 'error' }],
          input: [
            {
              comment: 'another comment',
            },
          ],
        })

        await controller.view()(req, res, null)

        expect(res.render).toHaveBeenCalledWith('amendBooking/changeComments.njk', {
          bookingId: 123,
          formValues: {
            comments: 'another comment',
          },
          errors: [{ text: 'error message', href: 'error' }],
        })
      })

      it('When there is no user input', async () => {
        bookingService.get.mockResolvedValue(bookingDetails)
        mockFlashState({
          errors: [{ text: 'error message', href: 'error' }],
          input: [],
        })

        await controller.view()(req, res, null)

        expect(res.render).toHaveBeenCalledWith('amendBooking/changeComments.njk', {
          bookingId: 123,
          formValues: {
            comments: 'some comment',
          },
          errors: [{ text: 'error message', href: 'error' }],
        })
      })
    })
  })

  describe('submit', () => {
    it('should redirect to comment change confirmation page when no errors exist', async () => {
      bookingService.get.mockResolvedValue(bookingDetails)
      req.params.bookingId = '12'

      await controller.submit()(req, res, null)

      expect(res.redirect).toHaveBeenCalledWith(`/comments-change-confirmed/12`)
    })

    it('should successfully update a comment when an update is made', async () => {
      bookingService.get.mockResolvedValue(bookingDetails)
      req.params.bookingId = '12'
      req.body.comment = 'another comment'

      await controller.submit()(req, res, null)

      expect(bookingService.updateComments).toHaveBeenCalledWith(res.locals, 12, 'another comment')
    })

    describe('when errors are present', () => {
      beforeEach(() => {
        req.errors = [{ text: 'error message', href: 'error' }]
        req.params.bookingId = '12'
      })

      it('should place errors into flash', async () => {
        bookingService.get.mockResolvedValue(bookingDetails)

        await controller.submit()(req, res, null)
        expect(req.flash).toHaveBeenCalledWith('errors', req.errors)
      })

      it('should place input into flash', async () => {
        bookingService.get.mockResolvedValue(bookingDetails)

        await controller.submit()(req, res, null)
        expect(req.flash).toHaveBeenCalledWith('input', req.body)
      })

      it('should redirect to same page', async () => {
        bookingService.get.mockResolvedValue(bookingDetails)

        await controller.submit()(req, res, null)
        expect(res.redirect).toHaveBeenCalledWith(`/change-comments/12`)
      })
    })
  })
})
