const { NotifyClient } = require('notifications-node-client')
const config = require('../config')

const notifyClient = config.notifications.enabled
  ? new NotifyClient(config.notifications.notifyKey)
  : {
      sendEmail() {
        return Promise.resolve({})
      },
    }

module.exports = {
  notifyClient,
}
