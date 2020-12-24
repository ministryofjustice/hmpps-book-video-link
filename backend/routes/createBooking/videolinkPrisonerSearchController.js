const moment = require('moment')
const { formatName } = require('../../utils')
const config = require('../../config')
const videolinkPrisonerSearchValidation = require('./videolinkPrisonerSearchValidation')
const dobValidation = require('../../shared/dobValidation')

module.exports = ({ prisonApi }) => async (req, res) => {
  const prisons = await prisonApi.getAgencies(res.locals)
  let searchResults = []
  const hasSearched = Boolean(Object.keys(req.query).length)
  const errors = hasSearched ? videolinkPrisonerSearchValidation(req.query) : []
  const { firstName, lastName, prisonNumber, dobDay, dobMonth, dobYear, prison } = req.query

  if (hasSearched && !errors.length) {
    const { dobIsValid, dateOfBirth } = dobValidation(dobDay, dobMonth, dobYear)

    searchResults = await prisonApi.globalSearch(
      res.locals,
      {
        offenderNo: prisonNumber,
        lastName,
        firstName,
        dateOfBirth: dobIsValid ? dateOfBirth.format('YYYY-MM-DD') : undefined,
        location: 'IN',
      },
      1000
    )
  }

  return res.render('videolinkPrisonerSearch.njk', {
    agencyOptions: prisons
      .map(agency => ({ value: agency.agencyId, text: agency.formattedDescription || agency.description }))
      .sort((a, b) => a.text.localeCompare(b.text)),
    errors,
    formValues: req.query,
    results: searchResults
      .filter(result => (prison ? prison === result.latestLocationId : result))
      .map(result => {
        const { offenderNo, latestLocationId, pncNumber } = result
        const name = formatName(result.firstName, result.lastName)

        return {
          name,
          offenderNo,
          dob: result.dateOfBirth ? moment(result.dateOfBirth).format('D MMMM YYYY') : undefined,
          prison: result.latestLocation,
          prisonId: latestLocationId,
          pncNumber: pncNumber || '--',
          addAppointmentHTML: config.app.videoLinkEnabledFor.includes(latestLocationId)
            ? `<a href="/${latestLocationId}/offenders/${offenderNo}/add-court-appointment" class="govuk-link" data-qa="book-vlb-link">Book video link<span class="govuk-visually-hidden"> for ${name}, prison number ${offenderNo}</span></a>`
            : '',
        }
      }),
    hasSearched,
    hasOtherSearchDetails: prisonNumber || dobDay || dobMonth || dobYear || prison,
  })
}
