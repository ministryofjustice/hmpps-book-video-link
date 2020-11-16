const videolinkPrisonerSearchController = require('../controllers/videolink/search/videolinkPrisonerSearch')
const errorHandler = require('../middleware/errorHandler')
const config = require('../config')

config.app.videoLinkEnabledFor = ['MDI']

jest.mock('../middleware/errorHandler')

describe('Video link prisoner search', () => {
  const prisonApi = {}
  const oauthApi = {}

  let req
  let res
  let controller

  beforeEach(() => {
    req = {
      originalUrl: 'http://localhost',
      query: {},
    }
    res = { locals: {}, render: jest.fn(), redirect: jest.fn() }

    oauthApi.userRoles = jest.fn()
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

    controller = videolinkPrisonerSearchController({ prisonApi })
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
      await controller(req, res)

      expect(prisonApi.getAgencies).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('videolinkPrisonerSearch.njk', {
        agencyOptions,
        errors: [],
        formValues: {},
        hasSearched: false,
        homeUrl: '/',
        results: [],
      })
    })
  })
  describe('index', () => {
    describe('when the user does have the correct roles', () => {
      describe('when a search has been made', () => {
        beforeEach(() => {
          prisonApi.globalSearch.mockReturnValue([
            {
              offenderNo: 'G0011GX',
              firstName: 'TEST',
              middleNames: 'ING',
              lastName: 'OFFENDER',
              dateOfBirth: '1980-07-17',
              latestLocationId: 'LEI',
              latestLocation: 'Leeds',
              pncNumber: '1/2345',
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
          ])
        })

        describe('with a prison number', () => {
          const prisonNumber = 'G0011GX'

          it('should make the correct search', async () => {
            req.query = { prisonNumber }

            await controller(req, res)

            expect(prisonApi.globalSearch).toHaveBeenCalledWith(
              res.locals,
              {
                offenderNo: prisonNumber,
                location: 'IN',
              },
              1000
            )
            expect(res.render).toHaveBeenCalledWith(
              'videolinkPrisonerSearch.njk',
              expect.objectContaining({
                formValues: { prisonNumber },
                hasSearched: true,
              })
            )
          })
        })

        describe('with a name', () => {
          const lastName = 'Offender'

          beforeEach(() => {
            req.query = { lastName }
          })

          it('should make the correct search', async () => {
            await controller(req, res)

            expect(prisonApi.globalSearch).toHaveBeenCalledWith(
              res.locals,
              {
                lastName,
                location: 'IN',
              },
              1000
            )
            expect(res.render).toHaveBeenCalledWith(
              'videolinkPrisonerSearch.njk',
              expect.objectContaining({
                formValues: { lastName },
                hasSearched: true,
              })
            )
          })

          it('should return the correctly formatted results', async () => {
            await controller(req, res)

            expect(res.render).toHaveBeenCalledWith(
              'videolinkPrisonerSearch.njk',
              expect.objectContaining({
                formValues: { lastName },
                hasSearched: true,
                results: [
                  {
                    addAppointmentHTML: '',
                    dob: '17 July 1980',
                    name: 'Test Offender',
                    offenderNo: 'G0011GX',
                    pncNumber: '1/2345',
                    prison: 'Leeds',
                    prisonId: 'LEI',
                  },
                  {
                    addAppointmentHTML:
                      '<a href="/MDI/offenders/A0011GZ/add-court-appointment" class="govuk-link" data-qa="book-vlb-link">Book video link<span class="govuk-visually-hidden"> for Test Offender, prison number A0011GZ</span></a>',
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

            it('should make the correct search and return less results', async () => {
              req.query = { lastName, prison }

              await controller(req, res)

              expect(res.render).toHaveBeenCalledWith(
                'videolinkPrisonerSearch.njk',
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
                        '<a href="/MDI/offenders/A0011GZ/add-court-appointment" class="govuk-link" data-qa="book-vlb-link">Book video link<span class="govuk-visually-hidden"> for Test Offender, prison number A0011GZ</span></a>',
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
        oauthApi.userRoles.mockReturnValue([{ roleCode: 'VIDEO_LINK_COURT_USER' }])
        prisonApi.getAgencies.mockImplementation(() => Promise.reject(new Error('Network error')))
        await controller(req, res)

        expect(errorHandler).toHaveBeenCalledWith(req, res, new Error('Network error'), '/')
      })

      it('should render the error template if there is an error with global search', async () => {
        oauthApi.userRoles.mockReturnValue([{ roleCode: 'VIDEO_LINK_COURT_USER' }])
        prisonApi.globalSearch.mockImplementation(() => Promise.reject(new Error('Network error')))
        req.query = { lastName: 'Offender' }
        await controller(req, res)

        expect(errorHandler).toHaveBeenCalledWith(req, res, new Error('Network error'), '/')
      })
    })
  })
})
