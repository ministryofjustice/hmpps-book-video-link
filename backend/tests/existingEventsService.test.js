const existingEventsService = require('../services/existingEventsService')

describe('existing events', () => {
  const prisonApi = {}
  const appointmentsService = {}
  let service

  beforeEach(() => {
    prisonApi.getActivityList = jest.fn()
    service = existingEventsService(prisonApi, appointmentsService)
  })

  describe('location availability', () => {
    beforeEach(() => {
      prisonApi.getVideoLinkLocations = jest.fn()
      prisonApi.getEventsAtLocations = jest.fn()
      prisonApi.getVideoLinkLocations.mockReturnValue(Promise.resolve([]))
      prisonApi.getLocationsForAppointments = jest.fn()
      appointmentsService.getVideoLinkLocations = jest.fn()
    })

    it('should adjust the main appointment time by one minute in the future', async () => {
      const locations = [{ value: 1, text: 'Location 1' }]
      const eventsAtLocations = [
        {
          locationId: 1,
          startTime: '2019-10-10T10:00:00',
          endTime: '2019-10-10T10:15:00',
          description: 'Video booking for John',
        },
      ]

      appointmentsService.getVideoLinkLocations.mockReturnValue(locations)
      prisonApi.getActivityList.mockReturnValue(Promise.resolve(eventsAtLocations))

      const availableLocations = await service.getAvailableLocationsForVLB(
        {},
        {
          agencyId: 'LEI',
          startTime: '2019-10-10T10:15',
          endTime: '2019-10-10T10:30',
          date: '2019-10-10',
          preAppointmentRequired: 'no',
          postAppointmentRequired: 'no',
        }
      )

      expect(availableLocations).toEqual({
        mainLocations: [{ text: 'Location 1', value: 1 }],
        postLocations: [],
        preLocations: [],
      })
    })
  })

  describe('getting events for offenders', () => {
    beforeEach(() => {
      prisonApi.getSentenceData = jest.fn()
      prisonApi.getVisits = jest.fn()
      prisonApi.getExternalTransfers = jest.fn()
    })

    describe('when there are no errors', () => {
      beforeEach(() => {
        prisonApi.getSentenceData = jest.fn().mockResolvedValue([
          {
            offenderNo: 'ABC123',
            firstName: 'Test',
            lastName: 'Offender',
            agencyLocationId: 'LEI',
            sentenceDetail: {
              releaseDate: '2019-12-11',
            },
          },
        ])
        prisonApi.getVisits = jest.fn().mockResolvedValue([
          {
            offenderNo: 'ABC123',
            locationId: 1,
            firstName: 'Test',
            lastName: 'Offender',
            event: 'VISIT',
            eventDescription: 'Visit',
            eventLocation: 'Visiting room',
            comment: 'A comment.',
            startTime: '2019-12-11T14:00:00',
            endTime: '2019-12-11T15:00:00',
          },
        ])
        prisonApi.getExternalTransfers = jest.fn().mockResolvedValue([
          {
            offenderNo: 'ABC123',
            locationId: 3,
            firstName: 'Test',
            lastName: 'Offender',
            event: 'TRANS',
            eventDescription: 'Transfer',
            eventLocation: 'Somewhere else',
            comment: 'A comment.',
            startTime: '2019-12-11T16:00:00',
            endTime: '2019-12-11T17:00:00',
          },
        ])
      })
    })
  })

  describe('get events for a location', () => {
    beforeEach(() => {
      prisonApi.getActivityList = jest.fn()
    })

    describe('when there are no errors', () => {
      beforeEach(() => {
        prisonApi.getActivityList = jest
          .fn()
          .mockResolvedValueOnce([
            {
              offenderNo: 'ABC123',
              locationId: 2,
              firstName: 'Test',
              lastName: 'Offender',
              event: 'VISIT',
              eventDescription: 'Visit',
              eventLocation: 'Visiting room',
              comment: 'A comment.',
              startTime: '2019-12-11T14:00:00',
              endTime: '2019-12-11T15:00:00',
            },
          ])
          .mockResolvedValueOnce([
            {
              offenderNo: 'ABC123',
              locationId: 3,
              firstName: 'Test',
              lastName: 'Offender',
              event: 'APPT',
              eventDescription: 'An appointment',
              eventLocation: 'Office 1',
              startTime: '2019-12-11T12:00:00',
              endTime: '2019-12-11T13:00:00',
            },
          ])
      })
    })
  })
})
