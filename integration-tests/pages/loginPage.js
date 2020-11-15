const page = require('./page')

const loginPage = () => page('Sign in')

export default {
  verifyOnPage: loginPage,
}
