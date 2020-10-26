const asyncMiddleware = require('../middleware/asyncHandler')

const factory = ({
  iepDetailsService,
  establishmentRollService,
  globalSearchService,
  movementsService,
  offenderLoader,
  appointmentsService,
  csvParserService,
  offenderService,
  caseNotesApi,
}) => {
  const getIepDetails = asyncMiddleware(async (req, res) => {
    const { offenderNo } = req.params
    const viewModel = await iepDetailsService.getIepDetails(res.locals, offenderNo, req.query)
    res.json(viewModel)
  })

  const getPossibleLevels = asyncMiddleware(async (req, res) => {
    const { currentIepLevel, agencyId } = req.query
    const viewModel = await iepDetailsService.getPossibleLevels(res.locals, currentIepLevel, agencyId)
    res.json(viewModel)
  })

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

  const getMovementsIn = asyncMiddleware(async (req, res) => {
    const { agencyId } = req.params
    const viewModel = await movementsService.getMovementsIn(res.locals, agencyId)
    res.json(viewModel)
  })

  const getMovementsOut = asyncMiddleware(async (req, res) => {
    const { agencyId } = req.params
    const viewModel = await movementsService.getMovementsOut(res.locals, agencyId)
    res.json(viewModel)
  })

  const getOffendersInReception = asyncMiddleware(async (req, res) => {
    const { agencyId } = req.params
    const viewModel = await movementsService.getOffendersInReception(res.locals, agencyId)
    res.json(viewModel)
  })

  const getOffendersCurrentlyOutOfLivingUnit = asyncMiddleware(async (req, res) => {
    const { livingUnitId } = req.params
    const viewModel = await movementsService.getOffendersCurrentlyOutOfLivingUnit(res.locals, livingUnitId)
    res.json(viewModel)
  })

  const getOffendersCurrentlyOutOfAgency = asyncMiddleware(async (req, res) => {
    const { agencyId } = req.params
    const viewModel = await movementsService.getOffendersCurrentlyOutOfAgency(res.locals, agencyId)
    res.json(viewModel)
  })

  const getOffendersEnRoute = asyncMiddleware(async (req, res) => {
    const { agencyId } = req.params
    const viewModel = await movementsService.getOffendersEnRoute(res.locals, agencyId)
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

  const changeIepLevel = asyncMiddleware(async (req, res) => {
    const { offenderNumber } = req.params
    await iepDetailsService.changeIepLevel(res.locals, offenderNumber, req.body)
    res.end()
  })

  const getCaseNote = asyncMiddleware(async (req, res) => {
    const { offenderNumber, caseNoteId } = req.params
    const caseNote = await caseNotesApi.getCaseNote(res.locals, offenderNumber, caseNoteId)
    res.json(caseNote)
  })

  return {
    getEstablishmentRollCount,
    globalSearch,
    getMovementsIn,
    getMovementsOut,
    getIepDetails,
    getOffender,
    getOffendersInReception,
    getOffendersCurrentlyOutOfLivingUnit,
    getOffendersCurrentlyOutOfAgency,
    getOffendersEnRoute,
    uploadOffenders,
    getAppointmentOptions,
    bulkAppointmentsCsvTemplate,
    changeIepLevel,
    getPossibleLevels,
    getCaseNote,
  }
}

module.exports = {
  factory,
}
