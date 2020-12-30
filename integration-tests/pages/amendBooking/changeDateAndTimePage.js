const page = require('../page')

const changeDateAndTimePage = () =>
  page('Change video link date and time', {
    continue: () => cy.get('button[type="submit"]'),
  })

export default {
  verifyOnPage: changeDateAndTimePage,
}
