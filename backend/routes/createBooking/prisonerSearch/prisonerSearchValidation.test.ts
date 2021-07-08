import PrisonerSearchValidation from './prisonerSearchValidation'

const videolinkPrisonerSearchValidation = new PrisonerSearchValidation()

describe('prisoner search validation', () => {
  it('should error with no last name or prison number', async () => {
    expect(videolinkPrisonerSearchValidation.validate({})).toEqual([
      { href: '#lastName', text: "You must search using either the prisoner's last name or prison number" },
    ])
  })
  it('should error if only first name entered', async () => {
    expect(videolinkPrisonerSearchValidation.validate({ firstName: 'Terry' })).toEqual([
      { text: 'Enter a last name', href: '#lastName' },
    ])
  })

  it('should error when only first name entered and it is a zero length string', async () => {
    expect(videolinkPrisonerSearchValidation.validate({ firstName: '' })).toEqual([
      { href: '#lastName', text: "You must search using either the prisoner's last name or prison number" },
    ])
  })

  it('should error when only last name entered and it is a zero length string', async () => {
    expect(videolinkPrisonerSearchValidation.validate({ lastName: '' })).toEqual([
      { href: '#lastName', text: "You must search using either the prisoner's last name or prison number" },
    ])
  })

  it('should error if only prison number entered and it is a zero length string', async () => {
    expect(videolinkPrisonerSearchValidation.validate({ prisonNumber: '' })).toEqual([
      { href: '#lastName', text: "You must search using either the prisoner's last name or prison number" },
    ])
  })
  it('should error if both last name and prison number are zero length strings', async () => {
    expect(videolinkPrisonerSearchValidation.validate({ lastName: '', prisonNumber: '' })).toEqual([
      { href: '#lastName', text: "You must search using either the prisoner's last name or prison number" },
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
})
