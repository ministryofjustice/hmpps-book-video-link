const asyncMiddleware = require('../middleware/asyncHandler')

const factory = ({
  establishmentRollService,
  globalSearchService,
  offenderLoader,
  appointmentsService,
  csvParserService,
  offenderService,
}) => {
  const getEstablishmentRollCount = asyncMiddleware(async (req, res) => {
    const { agencyId, unassigned } = req.query
    const viewModel = await establishmentRollService.getEstablishmentRollCount(res.locals, agencyId, unassigned)
    res.json(viewModel)
  })

  const globalSearch = asyncMiddleware(async (req, res) => {
    const { searchText, genderFilter, locationFilter, dateOfBirthFilter } = req.query

    const hasSearched = Boolean(Object.keys(req.query).length)
    // The original url here is the /api one which is not what we want
    // the user to get back to. The frontend url is held in the referer
    if (hasSearched) req.session.prisonerSearchUrl = req.headers.referer
    const viewModel = await globalSearchService.globalSearch(
      res.locals,
      searchText,
      genderFilter,
      locationFilter,
      dateOfBirthFilter
    )
    res.set(res.locals.responseHeaders)
    res.json(viewModel)
  })

  const getOffender = asyncMiddleware(async (req, res) => {
    const { offenderNo } = req.params
    const viewModel = await offenderService.getOffender(res.locals, offenderNo)
    res.json(viewModel)
  })

  const uploadOffenders = asyncMiddleware(async (req, res) => {
    const { file } = req.files
    const { agencyId } = req.params

    csvParserService
      .loadAndParseCsvFile(file)
      .then(async fileContent => {
        const viewModel = await offenderLoader.loadFromCsvContent(res.locals, fileContent, agencyId)
        res.json(viewModel)
      })
      .catch(error => {
        res.status(400)
        res.send(error.message)
        res.end()
      })
  })

  const bulkAppointmentsCsvTemplate = asyncMiddleware(async (req, res) => {
    res.setHeader('Content-disposition', 'attachment; filename=offenders-for-appointments.csv')
    res.set('Content-Type', 'text/csv')
    res.status(200).send(`Prison number\n,\n`)
    res.end()
  })

  const getAppointmentOptions = asyncMiddleware(async (req, res) => {
    const { agencyId } = req.query
    const viewModel = await appointmentsService.getAppointmentOptions(res.locals, agencyId)
    res.json(viewModel)
  })

  return {
    getEstablishmentRollCount,
    globalSearch,
    getOffender,
    uploadOffenders,
    getAppointmentOptions,
    bulkAppointmentsCsvTemplate,
  }
}

module.exports = {
  factory,
}
