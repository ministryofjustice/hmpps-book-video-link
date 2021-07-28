import PrisonerSearchValidation from './prisonerSearchValidation'

const videolinkPrisonerSearchValidation = new PrisonerSearchValidation()

describe('prisoner search validation', () => {
  it('should error with no last name, prison number or PNC number', async () => {
    expect(videolinkPrisonerSearchValidation.validate({})).toEqual([
      { href: '#lastName', text: "You must search using either the prisoner's last name, prison number or PNC Number" },
    ])
  })
  it('should error if only first name entered', async () => {
    expect(videolinkPrisonerSearchValidation.validate({ firstName: 'Terry' })).toEqual([
      { text: 'Enter a last name', href: '#lastName' },
    ])
  })

  it('should error when only first name entered and it is a zero length string', async () => {
    expect(videolinkPrisonerSearchValidation.validate({ firstName: '' })).toEqual([
      { href: '#lastName', text: "You must search using either the prisoner's last name, prison number or PNC Number" },
    ])
  })

  it('should error when only last name entered and it is a zero length string', async () => {
    expect(videolinkPrisonerSearchValidation.validate({ lastName: '' })).toEqual([
      { href: '#lastName', text: "You must search using either the prisoner's last name, prison number or PNC Number" },
    ])
  })

  it('should error if only prison number entered and it is a zero length string', async () => {
    expect(videolinkPrisonerSearchValidation.validate({ prisonNumber: '' })).toEqual([
      { href: '#lastName', text: "You must search using either the prisoner's last name, prison number or PNC Number" },
    ])
  })

  it('should error if only PNC number entered and it is a zero length string', async () => {
    expect(videolinkPrisonerSearchValidation.validate({ pncNumber: '' })).toEqual([
      { href: '#lastName', text: "You must search using either the prisoner's last name, prison number or PNC Number" },
    ])
  })

  it('should error if last name, prison number and PNC number are zero length strings', async () => {
    expect(videolinkPrisonerSearchValidation.validate({ lastName: '', prisonNumber: '', pncNumber: '' })).toEqual([
      { href: '#lastName', text: "You must search using either the prisoner's last name, prison number or PNC Number" },
    ])
  })
  it('should error if prison number is not required length', async () => {
    expect(videolinkPrisonerSearchValidation.validate({ prisonNumber: 'A1234A' })).toEqual([
      { text: 'Enter a prison number using 7 characters in the format A1234AA', href: '#prisonNumber' },
    ])
  })

  it('should error if prison number does not start with a letter', async () => {
    expect(videolinkPrisonerSearchValidation.validate({ prisonNumber: '12345AA' })).toEqual([
      { text: 'Enter a prison number starting with a letter in the format A1234AA', href: '#prisonNumber' },
    ])
  })

  it('should error if PNC number is not in the correct format', async () => {
    expect(videolinkPrisonerSearchValidation.validate({ pncNumber: '0123456A' })).toEqual([
      { text: 'Enter a PNC number in the format 01/23456A or 2001/23456A', href: '#pncNumber' },
    ])
    expect(videolinkPrisonerSearchValidation.validate({ pncNumber: '201/23456A' })).toEqual([
      { text: 'Enter a PNC number in the format 01/23456A or 2001/23456A', href: '#pncNumber' },
    ])
    expect(videolinkPrisonerSearchValidation.validate({ pncNumber: '1/23456A' })).toEqual([
      { text: 'Enter a PNC number in the format 01/23456A or 2001/23456A', href: '#pncNumber' },
    ])
  })
})
