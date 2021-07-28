import moment from 'moment'
import { RequestHandler, Request, Response } from 'express'
import { formatName, trimObjectValues } from '../../../utils'
import config from '../../../config'
import PrisonerSearchValidation from './prisonerSearchValidation'
import dobValidation from '../../../shared/dobValidation'
import type PrisonApi from '../../../api/prisonApi'

const videolinkPrisonerSearchValidation = new PrisonerSearchValidation()

export default class PrisonerSearchController {
  public constructor(private readonly prisonApi: PrisonApi) {}

  public submit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const prisons = await this.prisonApi.getAgencies(res.locals)
      let searchResults = []
      const hasSearched = Boolean(Object.keys(req.query).length)
      const formValues = trimObjectValues(req.query)
      const { firstName, lastName, prisonNumber, pncNumber, dobDay, dobMonth, dobYear, prison } = formValues
      const errors = hasSearched ? videolinkPrisonerSearchValidation.validate(formValues) : []

      if (hasSearched && !errors.length) {
        const { dobIsValid, dateOfBirth } = dobValidation(dobDay, dobMonth, dobYear)

        searchResults = await this.prisonApi.globalSearch(
          res.locals,
          {
            offenderNo: prisonNumber,
            pncNumber,
            lastName,
            firstName,
            dateOfBirth: dobIsValid ? dateOfBirth.format('YYYY-MM-DD') : undefined,
            location: 'IN',
            prioritisedMatch: true,
          },
          1000
        )
      }

      return res.render('createBooking/prisonerSearch.njk', {
        agencyOptions: prisons
          .map(agency => ({ value: agency.agencyId, text: agency.formattedDescription || agency.description }))
          .sort((a, b) => a.text.localeCompare(b.text)),
        errors,
        formValues,
        results: searchResults
          .filter(result => (prison ? prison === result.latestLocationId : result))
          .map(result => {
            const { offenderNo, latestLocationId } = result
            const name = formatName(result.firstName, result.lastName)

            return {
              name,
              offenderNo,
              dob: result.dateOfBirth ? moment(result.dateOfBirth).format('D MMMM YYYY') : undefined,
              prison: result.latestLocation,
              prisonId: latestLocationId,
              pncNumber: result.pncNumber || '--',
              addAppointmentHTML: config.app.videoLinkEnabledFor.includes(latestLocationId)
                ? `<a href="/${latestLocationId}/offenders/${offenderNo}/new-court-appointment" class="govuk-link govuk-link--no-visited-state" data-qa="book-vlb-link">Book video link<span class="govuk-visually-hidden"> for ${name}, prison number ${offenderNo}</span></a>`
                : '',
            }
          }),
        hasSearched,
        hasOtherSearchDetails: prisonNumber || dobDay || dobMonth || dobYear || prison,
      })
    }
  }
}
