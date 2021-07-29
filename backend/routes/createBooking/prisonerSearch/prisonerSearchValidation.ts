import dobValidation from '../../../shared/dobValidation'
import { assertHasOptionalStringValues } from '../../../utils'

import type { ValidationError } from '../../../middleware/validationMiddleware'

export default class PrisonerSearchValidation {
  public validate(formValues: unknown): ValidationError[] {
    assertHasOptionalStringValues(formValues, [
      'firstName',
      'lastName',
      'prisonNumber',
      'pncNumber',
      'dobDay',
      'dobMonth',
      'dobYear',
      'prison',
    ])
    const { firstName, lastName, prisonNumber, pncNumber, dobDay, dobMonth, dobYear } = formValues
    const { dobErrors } = dobValidation(dobDay, dobMonth, dobYear)
    const videolinkPrisonerSearchErrors = [...dobErrors]

    if (!lastName && !prisonNumber && !pncNumber) {
      if (firstName) {
        videolinkPrisonerSearchErrors.push({ text: 'Enter a last name', href: '#lastName' })
      }

      if (!firstName) {
        videolinkPrisonerSearchErrors.push({
          text: "You must search using either the prisoner's last name, prison number or PNC Number",
          href: '#lastName',
        })
      }
    }

    if (prisonNumber) {
      if (prisonNumber.length !== 7) {
        videolinkPrisonerSearchErrors.push({
          text: 'Enter a prison number using 7 characters in the format A1234AA',
          href: '#prisonNumber',
        })
      }

      const startsWithLetter = /^[a-zA-Z]/

      if (!startsWithLetter.test(prisonNumber)) {
        videolinkPrisonerSearchErrors.push({
          text: 'Enter a prison number starting with a letter in the format A1234AA',
          href: '#prisonNumber',
        })
      }
    }

    if (pncNumber) {
      const pncFormat = /^([0-9]{2}|[0-9]{4})[/][0-9]+[a-zA-Z]/

      if (!pncFormat.test(pncNumber)) {
        videolinkPrisonerSearchErrors.push({
          text: 'Enter a PNC number in the format 01/23456A or 2001/23456A',
          href: '#pncNumber',
        })
      }
    }

    return videolinkPrisonerSearchErrors
  }
}
