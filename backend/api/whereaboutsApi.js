const whereaboutsApiFactory = client => {
  const processResponse = () => response => response.body

  const get = (context, url) => client.get(context, url).then(processResponse())
  const post = (context, url, data) => client.post(context, url, data).then(processResponse())

  const getCourtLocations = context => get(context, '/court/all-courts')

  const videoLinkBookings = (context, body) => post(context, '/video-link-bookings', body)

  const getVideoLinkAppointments = (context, body) => post(context, '/court/video-link-appointments', body)

  return {
    getCourtLocations,
    videoLinkBookings,
    getVideoLinkAppointments,
  }
}

module.exports = {
  whereaboutsApiFactory,
}
