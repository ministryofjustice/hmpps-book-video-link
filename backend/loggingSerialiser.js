const bunyan = require('bunyan')

module.exports = {
  err: bunyan.stdSerializers.err,
  req: bunyan.stdSerializers.req,
  res(res) {
    const res1 = bunyan.stdSerializers.res(res)
    res1.username = res.locals && res.locals.user && res.locals.user.username
    return res1
  },
}
