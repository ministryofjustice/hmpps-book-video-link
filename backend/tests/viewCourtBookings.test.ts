import moment from 'moment'
import viewCourtBookingsRouter from '../controllers/viewCourtBookingsRouter'
import WhereaboutsApi from '../api/whereaboutsApi'

jest.mock('../api/whereaboutsApi')

describe('View court bookings', () => {
  const prisonApi = {
    getAppointmentsForAgency: jest.fn(),
  }
  const whereaboutsApi = new WhereaboutsApi(null) as jest.Mocked<WhereaboutsApi>

  let req
  let res
  let controller

  beforeEach(() => {
    req = {
      query: {},
      originalUrl: 'http://localhost',
      session: {
        userDetails: {
          name: 'Test User',
        },
      },
    }
    res = { locals: {}, render: jest.fn() }

    prisonApi.getAppointmentsForAgency.mockReturnValue([])

    whereaboutsApi.getVideoLinkAppointments.mockResolvedValue({ appointments: [] })
    whereaboutsApi.getCourtLocations.mockResolvedValue({ courtLocations: [] })

    controller = viewCourtBookingsRouter(prisonApi, whereaboutsApi)
  })

  beforeAll(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => 1577869200000) // 2020-01-01 09:00:00
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  describe('when the page is first loaded with no results', () => {
    it('should make the correct API calls', async () => {
      await controller(req, res)

      expect(prisonApi.getAppointmentsForAgency).toHaveBeenCalledWith(res.locals, {
        agencyId: 'WWI',
        date: '2020-01-01',
      })
      expect(whereaboutsApi.getVideoLinkAppointments).toHaveBeenCalledWith(res.locals, [])
      expect(whereaboutsApi.getCourtLocations).toHaveBeenCalledWith(res.locals)
    })

    it('should render the correct template information', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('viewCourtBookings.njk', {
        appointmentRows: [],
        date: moment(),
        title: 'Video link bookings for 1 January 2020',
        courtOption: undefined,
        courts: [{ value: 'Other', text: 'Other' }],
        user: { displayName: 'Test User' },
      })
    })

    describe('when there are selected search parameters with results', () => {
      beforeEach(() => {
        prisonApi.getAppointmentsForAgency.mockReturnValue([
          {
            id: 1,
            offenderNo: 'ABC123',
            firstName: 'OFFENDER',
            lastName: 'ONE',
            date: '2020-01-02',
            startTime: '2020-01-02T12:30:00',
            appointmentTypeDescription: 'Medical - Other',
            appointmentTypeCode: 'MEOT',
            locationDescription: 'HEALTH CARE',
            locationId: 123,
            auditUserId: 'STAFF_1',
            agencyId: 'WWI',
          },
          {
            id: 2,
            offenderNo: 'ABC456',
            firstName: 'OFFENDER',
            lastName: 'TWO',
            date: '2020-01-02',
            startTime: '2020-01-02T13:30:00',
            endTime: '2020-01-02T14:30:00',
            appointmentTypeDescription: 'Gym - Exercise',
            appointmentTypeCode: 'GYM',
            locationDescription: 'GYM',
            locationId: 456,
            auditUserId: 'STAFF_2',
            agencyId: 'WWI',
          },
          {
            id: 3,
            offenderNo: 'ABC789',
            firstName: 'OFFENDER',
            lastName: 'THREE',
            date: '2020-01-02',
            startTime: '2020-01-02T14:30:00',
            endTime: '2020-01-02T15:30:00',
            appointmentTypeDescription: 'Video Link booking',
            appointmentTypeCode: 'VLB',
            locationDescription: 'VCC ROOM',
            locationId: 789,
            auditUserId: 'STAFF_3',
            agencyId: 'WWI',
          },
          {
            id: 4,
            offenderNo: 'ABC456',
            firstName: 'OFFENDER',
            lastName: 'FOUR',
            date: '2020-01-02',
            startTime: '2020-01-02T13:30:00',
            endTime: '2020-01-02T14:30:00',
            appointmentTypeDescription: 'Video Link booking',
            appointmentTypeCode: 'VLB',
            locationDescription: 'VCC ROOM',
            locationId: 456,
            auditUserId: 'STAFF_2',
            agencyId: 'WWI',
          },
          {
            id: 5,
            offenderNo: 'ABC456',
            firstName: 'OFFENDER',
            lastName: 'FIVE',
            date: '2020-01-02',
            startTime: '2020-01-02T15:30:00',
            endTime: '2020-01-02T16:30:00',
            appointmentTypeDescription: 'Video Link booking',
            appointmentTypeCode: 'VLB',
            locationDescription: 'VCC ROOM',
            locationId: 456,
            auditUserId: 'STAFF_2',
            agencyId: 'WWI',
          },
        ])

        whereaboutsApi.getVideoLinkAppointments.mockResolvedValue({
          appointments: [
            {
              id: 1,
              bookingId: 1,
              appointmentId: 3,
              court: 'Wimbledon',
              hearingType: 'MAIN',
              createdByUsername: 'username1',
              madeByTheCourt: true,
            },
            {
              id: 2,
              bookingId: 1,
              appointmentId: 4,
              court: 'A Different Court',
              hearingType: 'MAIN',
              createdByUsername: 'username1',
              madeByTheCourt: true,
            },
            {
              id: 3,
              bookingId: 1,
              appointmentId: 5,
              court: 'Yet another court',
              hearingType: 'MAIN',
              createdByUsername: 'username1',
              madeByTheCourt: true,
            },
          ],
        })

        whereaboutsApi.getCourtLocations.mockResolvedValue({
          courtLocations: ['Wimbledon', 'Southwark'],
        })

        req.query = {
          date: '2 January 2020',
        }
      })
      it('should make the correct API calls', async () => {
        await controller(req, res)

        expect(prisonApi.getAppointmentsForAgency).toHaveBeenCalledWith(res.locals, {
          agencyId: 'WWI',
          date: '2020-01-02',
        })
        expect(whereaboutsApi.getVideoLinkAppointments).toHaveBeenCalledWith(res.locals, [3, 4, 5])
        expect(whereaboutsApi.getCourtLocations).toHaveBeenCalledWith(res.locals)
      })

      it('should render the correct template information', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'viewCourtBookings.njk',
          expect.objectContaining({
            appointmentRows: [
              [
                { text: '13:30 to 14:30' },
                {
                  text: 'Offender Four',
                },
                { text: 'VCC ROOM' },
                { text: 'A Different Court' },
              ],
              [
                { text: '14:30 to 15:30' },
                {
                  text: 'Offender Three',
                },
                { text: 'VCC ROOM' },
                { text: 'Wimbledon' },
              ],
              [
                { text: '15:30 to 16:30' },
                {
                  text: 'Offender Five',
                },
                { text: 'VCC ROOM' },
                { text: 'Yet another court' },
              ],
            ],
            date: moment('2 January 2020', 'D MMMM YYYY'),
            title: 'Video link bookings for 2 January 2020',
            courtOption: undefined,
            courts: [
              { text: 'Southwark', value: 'Southwark' },
              { text: 'Wimbledon', value: 'Wimbledon' },
              { text: 'Other', value: 'Other' },
            ],
            user: { displayName: 'Test User' },
          })
        )
      })

      it('should only return appointments for a selected court', async () => {
        req.query = {
          ...req.query,
          courtOption: 'Wimbledon',
        }

        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'viewCourtBookings.njk',
          expect.objectContaining({
            appointmentRows: [
              [
                { text: '14:30 to 15:30' },
                {
                  text: 'Offender Three',
                },
                { text: 'VCC ROOM' },
                { text: 'Wimbledon' },
              ],
            ],
          })
        )
      })

      it('should only return appointments in unsupported courts when Other is selected', async () => {
        req.query = {
          ...req.query,
          courtOption: 'Other',
        }

        await controller(req, res)

        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'viewCourtBookings.njk',
          expect.objectContaining({
            appointmentRows: [
              [
                { text: '13:30 to 14:30' },
                {
                  text: 'Offender Four',
                },
                { text: 'VCC ROOM' },
                { text: 'A Different Court' },
              ],
              [
                { text: '15:30 to 16:30' },
                {
                  text: 'Offender Five',
                },
                { text: 'VCC ROOM' },
                { text: 'Yet another court' },
              ],
            ],
            title: 'Video link bookings for 2 January 2020 - Other',
          })
        )
      })
    })

    describe('when there is an error retrieving information', () => {
      it('should render the error template', async () => {
        whereaboutsApi.getCourtLocations.mockRejectedValue(new Error('Problem retrieving courts'))
        await expect(controller(req, res)).rejects.toThrow('Problem retrieving courts')
      })
    })
  })
})
