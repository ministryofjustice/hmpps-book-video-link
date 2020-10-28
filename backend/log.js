const Logger = require('bunyan')

module.exports = new Logger({
  name: 'book-video-link',
  streams: [
    {
      stream: process.stdout,
      level: 'error',
    },
  ],
})
