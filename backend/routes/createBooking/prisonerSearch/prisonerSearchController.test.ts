import { PrisonerDetail } from 'prisonApi'
import PrisonApi from '../../../api/prisonApi'
import PrisonerSearchController from './prisonerSearchController'
import config from '../../../config'
import { mockRequest, mockResponse } from '../../__test/requestTestUtils'

jest.mock('../../../api/prisonApi')

const prisonApi = new PrisonApi(null) as jest.Mocked<PrisonApi>
config.app.videoLinkEnabledFor = ['MDI']

describe('Video link prisoner search', () => {
  let controller: PrisonerSearchController
  const req = mockRequest({})
  const res = mockResponse({})

  beforeEach(() => {
    prisonApi.getAgencies = jest.fn().mockReturnValue([
      {
        agencyId: 'PRISON2',
        description: 'PRISON 2',
        formattedDescription: 'Prison 2',
      },
      {
        agencyId: 'PRISON1',
        description: 'PRiSON 1',
        formattedDescription: 'Prison 1',
      },
    ])
    prisonApi.globalSearch = jest.fn()

    controller = new PrisonerSearchController(prisonApi)
  })

  const agencyOptions = [
    {
      value: 'PRISON1',
      text: 'Prison 1',
    },
    {
      value: 'PRISON2',
      text: 'Prison 2',
    },
  ]
  describe('when a search has not been made', () => {
    it('should render the prisoner search template', async () => {
      await controller.submit()(req, res, null)

      expect(prisonApi.getAgencies).toHaveBeenCalled()

      expect(res.render).toHaveBeenCalledWith('createBooking/prisonerSearch.njk', {
        agencyOptions,
        errors: [],
        formValues: {},
        hasSearched: false,
        results: [],
      })
    })
  })
  describe('index', () => {
    describe('when the user has the correct roles', () => {
      describe('when a search has been made', () => {
        beforeEach(() => {
          prisonApi.globalSearch.mockResolvedValue([
            {
              offenderNo: 'G0011GX',
              firstName: 'TEST',
              middleNames: 'ING',
              lastName: 'OFFENDER',
              dateOfBirth: '1980-07-17',
              latestLocationId: 'LEI',
              latestLocation: 'Leeds',
              pncNumber: '01/2345A',
            },
            {
              offenderNo: 'A0011GZ',
              firstName: 'TEST',
              middleNames: 'ING',
              lastName: 'OFFENDER',
              dateOfBirth: '1981-07-17',
              latestLocationId: 'MDI',
              latestLocation: 'Moorlands',
            },
          ] as PrisonerDetail[])
        })

        describe('with a prison number only', () => {
          const prisonNumber = 'G0011GX'

          it('should make the correct search', async () => {
            req.query = { prisonNumber }

            await controller.submit()(req, res, null)

            expect(prisonApi.globalSearch).toHaveBeenCalledWith(
              res.locals,
              {
                offenderNo: 'G0011GX',
                location: 'IN',
              },
              1000
            )
            expect(res.render).toHaveBeenCalledWith(
              'createBooking/prisonerSearch.njk',
              expect.objectContaining({
                formValues: { prisonNumber },
                hasSearched: true,
              })
            )
          })
        })

        describe('with a PNC number only', () => {
          const pncNumber = '01/2345A'

          it('should make the correct search', async () => {
            req.query = { pncNumber }

            await controller.submit()(req, res, null)

            expect(prisonApi.globalSearch).toHaveBeenCalledWith(
              res.locals,
              {
                pncNumber: '01/2345A',
                location: 'IN',
              },
              1000
            )
            expect(res.render).toHaveBeenCalledWith(
              'createBooking/prisonerSearch.njk',
              expect.objectContaining({
                formValues: { pncNumber },
                hasSearched: true,
              })
            )
          })
        })

        describe('with firstName and lastName only', () => {
          const firstName = 'Test'
          const lastName = 'Offender'

          beforeEach(() => {
            req.query = { firstName, lastName }
          })

          it('should make the correct search', async () => {
            await controller.submit()(req, res, null)

            expect(prisonApi.globalSearch).toHaveBeenCalledWith(
              res.locals,
              {
                lastName: 'Offender',
                firstName: 'Test',
                location: 'IN',
              },
              1000
            )
            expect(res.render).toHaveBeenCalledWith(
              'createBooking/prisonerSearch.njk',
              expect.objectContaining({
                formValues: { firstName, lastName },
                hasSearched: true,
              })
            )
          })

          it('should return the correctly formatted results', async () => {
            await controller.submit()(req, res, null)

            expect(res.render).toHaveBeenCalledWith(
              'createBooking/prisonerSearch.njk',
              expect.objectContaining({
                formValues: { firstName, lastName },
                hasSearched: true,
                results: [
                  {
                    addAppointmentHTML: '',
                    dob: '17 July 1980',
                    name: 'Test Offender',
                    offenderNo: 'G0011GX',
                    pncNumber: '01/2345A',
                    prison: 'Leeds',
                    prisonId: 'LEI',
                  },
                  {
                    addAppointmentHTML:
                      '<a href="/MDI/offenders/A0011GZ/new-court-appointment" class="govuk-link govuk-link--no-visited-state" data-qa="book-vlb-link">Book video link<span class="govuk-visually-hidden"> for Test Offender, prison number A0011GZ</span></a>',
                    dob: '17 July 1981',
                    name: 'Test Offender',
                    offenderNo: 'A0011GZ',
                    pncNumber: '--',
                    prison: 'Moorlands',
                    prisonId: 'MDI',
                  },
                ],
              })
            )
          })

          describe('and also with a prison', () => {
            const prison = 'MDI'

            it('should make the correct search and return fewer results', async () => {
              req.query = { lastName, prison }

              await controller.submit()(req, res, null)

              expect(res.render).toHaveBeenCalledWith(
                'createBooking/prisonerSearch.njk',
                expect.objectContaining({
                  results: [
                    {
                      name: 'Test Offender',
                      offenderNo: 'A0011GZ',
                      dob: '17 July 1981',
                      prison: 'Moorlands',
                      pncNumber: '--',
                      prisonId: 'MDI',
                      addAppointmentHTML:
                        '<a href="/MDI/offenders/A0011GZ/new-court-appointment" class="govuk-link govuk-link--no-visited-state" data-qa="book-vlb-link">Book video link<span class="govuk-visually-hidden"> for Test Offender, prison number A0011GZ</span></a>',
                    },
                  ],
                })
              )
            })
          })
        })
      })
    })

    describe('when there are API errors', () => {
      it('should render the error template if there is an error retrieving agencies', async () => {
        prisonApi.getAgencies.mockRejectedValue(new Error('Network error'))
        await expect(controller.submit()(req, res, null)).rejects.toThrow('Network error')
      })

      it('should render the error template if there is an error with global search', async () => {
        prisonApi.globalSearch.mockRejectedValue(new Error('Network error'))
        req.query = { lastName: 'Offender' }
        await expect(controller.submit()(req, res, null)).rejects.toThrow('Network error')
      })
    })
  })
})
