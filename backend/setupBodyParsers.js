const express = require('express')
const formData = require('express-form-data')
const os = require('os')

const router = express.Router()

module.exports = () => {
  router.use(
    formData.parse({
      uploadDir: os.tmpdir(),
      autoClean: true,
    })
  )
  router.use(express.urlencoded({ extended: true, limit: '5mb', parameterLimit: 1000000 }))
  router.use(express.json({ limit: '1mb' }))

  return router
}
