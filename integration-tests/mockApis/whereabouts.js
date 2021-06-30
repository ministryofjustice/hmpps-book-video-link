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

  stubCourts: (locations = courts, status = 200) => {
    return stubFor({
      request: {
        method: 'GET',
        url: '/whereabouts/court/courts',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: locations || {
          courtLocations: ['London', 'Sheffield', 'Leeds'],
        },
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

  stubGetVideoLinkBookings: (agencyId, date, bookings, courtId) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/whereabouts/court/video-link-bookings/prison/${agencyId}/date/${date}\\?courtId=${courtId}`,
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

  getFindAvailabilityRequests: () =>
    getMatchingRequests({
      method: 'POST',
      urlPath: '/whereabouts/court/vlb-appointment-location-finder',
    }).then(data => {
      const { requests } = data.body
      return requests.map(request => JSON.parse(request.body))
    }),

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
