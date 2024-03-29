const courts = require('./responses/courts.json')
const { stubFor, getMatchingRequests } = require('./wiremock')

module.exports = {
  stubHealth: (status = 200) => {
    return stubFor({
      request: {
        method: 'GET',
        url: '/whereabouts/health/ping',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
      },
    })
  },

  stubCourts: () => {
    return stubFor({
      request: {
        method: 'GET',
        url: '/whereabouts/court/courts',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: courts,
      },
    })
  },

  stubCourtEmailAddress: ({ courtId }) => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/whereabouts/court/courts/${courtId}/email`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: { email: 'court@email.com' },
      },
    })
  },

  stubCreateVideoLinkBooking: (status = 200) => {
    return stubFor({
      request: {
        method: 'POST',
        url: '/whereabouts/court/video-link-bookings',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: 123 || {},
      },
    })
  },

  getBookingRequest: () =>
    getMatchingRequests({
      method: 'POST',
      urlPath: '/whereabouts/court/video-link-bookings',
    }).then(data => {
      const { requests } = data.body
      return JSON.parse(requests[0].body)
    }),

  stubFindVideoLinkBookings: (date, bookings) => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/whereabouts/court/video-link-bookings/date/${date}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: bookings || [],
      },
    })
  },

  stubAvailabilityCheck: response => {
    return stubFor({
      request: {
        method: 'POST',
        url: `/whereabouts/court/video-link-booking-check`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response || [],
      },
    })
  },

  stubRoomAvailability: response => {
    return stubFor({
      request: {
        method: 'POST',
        url: `/whereabouts/court/vlb-appointment-location-finder`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response || [],
      },
    })
  },

  getAvailabilityCheckRequests: () =>
    getMatchingRequests({
      method: 'POST',
      urlPath: '/whereabouts/court/video-link-booking-check',
    }).then(data => {
      const { requests } = data.body
      return requests.map(request => JSON.parse(request.body))
    }),

  getFindAvailabilityRequests: () =>
    getMatchingRequests({
      method: 'POST',
      urlPath: '/whereabouts/court/vlb-appointment-location-finder',
    }).then(data => {
      const { requests } = data.body
      return requests.map(request => JSON.parse(request.body))
    }),

  stubGetRooms: (agencyId, response) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/whereabouts/video-link-rooms/${agencyId}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response || [],
      },
    })
  },

  stubGetVideoLinkBooking: booking => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/whereabouts/court/video-link-bookings/${booking.videoLinkBookingId}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: booking || {},
      },
    })
  },

  stubUpdateVideoLinkBookingComment: videoLinkBookingId => {
    return stubFor({
      request: {
        method: 'PUT',
        url: `/whereabouts/court/video-link-bookings/${videoLinkBookingId}/comment`,
      },
      response: {
        status: 204,
        headers: {
          'Content-Type': 'text/plain',
        },
      },
    })
  },

  getUpdateCommentRequest: () =>
    getMatchingRequests({
      method: 'PUT',
      urlPattern: '/whereabouts/court/video-link-bookings/.*?/comment',
    }).then(data => {
      const { requests } = data.body
      return requests[0].body
    }),

  stubUpdateVideoLinkBooking: videoLinkBookingId => {
    return stubFor({
      request: {
        method: 'PUT',
        url: `/whereabouts/court/video-link-bookings/${videoLinkBookingId}`,
      },
      response: {
        status: 204,
        headers: {
          'Content-Type': 'text/plain',
        },
      },
    })
  },

  getUpdateBookingRequest: () =>
    getMatchingRequests({
      method: 'PUT',
      urlPattern: '/whereabouts/court/video-link-bookings/.*?',
    }).then(data => {
      const { requests } = data.body
      return JSON.parse(requests[0].body)
    }),

  stubDeleteVideoLinkBooking: videoBookingId => {
    return stubFor({
      request: {
        method: 'DELETE',
        url: `/whereabouts/court/video-link-bookings/${videoBookingId}`,
      },
      response: {
        status: 204,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {},
      },
    })
  },

  stubGetBookingsCsv: body =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: '/whereabouts/court/video-link-bookings',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'text/csv;charset=UTF-8',
        },
        body,
      },
    }),

  stubGetEventsCsv: body =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: '/whereabouts/events/video-link-booking-events',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'text/csv;charset=UTF-8',
        },
        body,
      },
    }),
}
