const { NotifyClient } = require('notifications-node-client')
const config = require('./config')

const notifyClient = config.notifyClient.enabled
  ? new NotifyClient(config.notifications.notifyKey)
  : {
      async sendEmail() {
        return null
      },
    }

module.exports = {
  notifyClient,
}
