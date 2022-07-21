import { mockRequest, mockResponse } from '../__test/requestTestUtils'
import IndexController from './indexController'

const ERROR = [{ href: '#option', text: 'Select a download type' }]
let controller: IndexController

describe('IndexController', () => {
  describe('view', () => {
    beforeEach(() => {
      jest.resetAllMocks()
      controller = new IndexController()
    })

    it('displays first view', async () => {
      const req = mockRequest({})
      const res = mockResponse({})

      await controller.viewSelectionPage(req, res, null)
      expect(res.render).toHaveBeenCalledWith('downloadReports/index.njk', {
        errors: [],
        formValues: {},
      })
    })

    it('displays error', async () => {
      const req = mockRequest({})
      const res = mockResponse({})

      req.flash.mockReturnValue(ERROR)

      await controller.viewSelectionPage(req, res, null)
      expect(res.render).toHaveBeenCalledWith('downloadReports/index.njk', {
        errors: ERROR,
        formValues: {},
      })
    })
  })

  describe('submit request', () => {
    it('redirects to download by booking page', async () => {
      const req = mockRequest({
        body: {
          option: 'DATE_OF_BOOKING_WAS_MADE',
        },
      })
      const res = mockResponse({})

      await controller.submitSelection(req, res, null)
      expect(res.redirect).toHaveBeenCalledWith('/video-link-booking-events/download-by-booking-date')
    })

    it('redirects to download by hearing page', async () => {
      const req = mockRequest({
        body: {
          option: 'DATE_OF_HEARING',
        },
      })
      const res = mockResponse({})

      await controller.submitSelection(req, res, null)
      expect(res.redirect).toHaveBeenCalledWith('/video-link-booking-events/download-by-hearing-date')
    })

    it('displays error upon no selection ', async () => {
      const req = mockRequest({
        body: {
          option: '',
        },
      })
      const res = mockResponse({})

      await controller.submitSelection(req, res, null)
      expect(res.redirect).toHaveBeenCalledWith('/video-link-booking-events')
      expect(req.flash).toHaveBeenCalledWith('errors', ERROR)
    })
  })
})
