import {
  capitalize,
  properCaseName,
  mapToQueryString,
  groupBy,
  formatName,
  isToday,
  getDate,
  getTime,
  flattenCalls,
  assertHasStringValues,
  assertHasOptionalStringValues,
  forenameToInitial,
} from './utils'

describe('capitalize()', () => {
  describe('when a string IS NOT provided', () => {
    it('should return an empty string', () => {
      expect(capitalize(undefined)).toEqual('')
    })
  })

  describe('when a string IS provided', () => {
    it('should handle uppercased strings', () => {
      expect(capitalize('HOUSEBLOCK 1')).toEqual('Houseblock 1')
    })

    it('should handle lowercased strings', () => {
      expect(capitalize('houseblock 1')).toEqual('Houseblock 1')
    })

    it('should handle multiple word strings', () => {
      expect(capitalize('Segregation Unit')).toEqual('Segregation unit')
    })
  })
})

describe('properCaseName', () => {
  it('null string', () => {
    expect(properCaseName(null)).toEqual('')
  })
  it('empty string', () => {
    expect(properCaseName('')).toEqual('')
  })
  it('Lower Case', () => {
    expect(properCaseName('bob')).toEqual('Bob')
  })
  it('Mixed Case', () => {
    expect(properCaseName('GDgeHHdGr')).toEqual('Gdgehhdgr')
  })
  it('Multiple words', () => {
    expect(properCaseName('BOB SMITH')).toEqual('Bob smith')
  })
  it('Hyphenated', () => {
    expect(properCaseName('MONTGOMERY-FOSTER-SMYTH-WALLACE-BOB')).toEqual('Montgomery-Foster-Smyth-Wallace-Bob')
  })
})

describe('mapToQueryParams', () => {
  it('should handle empty maps', () => {
    expect(mapToQueryString({})).toEqual('')
  })

  it('should handle single key values', () => {
    expect(mapToQueryString({ key1: 'val' })).toEqual('key1=val')
  })

  it('should handle non-string, scalar values', () => {
    expect(mapToQueryString({ key1: 1, key2: true })).toEqual('key1=1&key2=true')
  })

  it('should ignore null values', () => {
    expect(mapToQueryString({ key1: 1, key2: null })).toEqual('key1=1')
  })

  it('should handle encode values', () => {
    expect(mapToQueryString({ key1: "Hi, I'm here" })).toEqual("key1=Hi%2C%20I'm%20here")
  })
})

describe('groupBy', () => {
  it('should handle empty lists', () => {
    expect(groupBy([], i => (i % 2 === 0 ? 'even' : 'odd'))).toEqual(new Map())
  })

  it('should handle null keys', () => {
    expect(groupBy([1, 2], _ => null)).toEqual(new Map([[null, [1, 2]]]))
  })

  it('should handle lists with content', () => {
    expect(groupBy([1, 2, 3, 4, 5], i => (i % 2 === 0 ? 'even' : 'odd'))).toEqual(
      new Map(Object.entries({ odd: [1, 3, 5], even: [2, 4] }))
    )
  })
})

describe('formatName', () => {
  it('Can format name', () => {
    expect(formatName('bob', 'smith')).toEqual('Bob Smith')
  })
  it('can format first name only', () => {
    expect(formatName('BOB', '')).toEqual('Bob')
  })
  it('can format last name only', () => {
    expect(formatName(undefined, 'Smith')).toEqual('Smith')
  })
  it('can format empty name', () => {
    expect(formatName('', '')).toEqual('')
  })
  it('can format no name', () => {
    expect(formatName(undefined, undefined)).toEqual('')
  })
})

describe('isToday()', () => {
  beforeAll(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => 1547424000000) // Sunday 2019-01-13T00:00:00.000
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('returns true if date is "Today"', () => {
    expect(isToday('Today')).toBe(true)
  })

  it('returns false if date is before today', () => {
    expect(isToday('2/01/2019')).toBe(false)
  })

  it('returns false if date is after today', () => {
    expect(isToday('19/01/2019')).toBe(false)
  })
})

describe('getDate()', () => {
  it('should return the correctly formatted date only', () => {
    expect(getDate('2019-09-23T15:30:00')).toEqual('Monday 23 September 2019')
  })

  it('should return Invalid message if invalid string is used', () => {
    expect(getDate('2019-13-23')).toEqual('Invalid date or time')
  })

  it('should return Invalid message if no date time string is used', () => {
    expect(getDate(undefined)).toEqual('Invalid date or time')
  })
})

describe('getTime()', () => {
  it('should return the correctly formatted time only', () => {
    expect(getTime('2019-09-23T15:30:00')).toEqual('15:30')
  })

  it('should return Invalid message if invalid string is used', () => {
    expect(getTime('2019-13-23')).toEqual('Invalid date or time')
  })

  it('should return Invalid message if no date time string is used', () => {
    expect(getTime(undefined)).toEqual('Invalid date or time')
  })
})

describe('flatten call', () => {
  it('Single item', () => {
    const param = [Promise.resolve([1])]
    return expect(flattenCalls(param)).resolves.toEqual([1])
  })

  it('Multiple items', () => {
    const param = [Promise.resolve([1]), Promise.resolve([2, 3])]
    return expect(flattenCalls(param)).resolves.toEqual([1, 2, 3])
  })
})

describe('assertHasStringValues', () => {
  it('Has required fields', () => {
    const record: unknown = { name: 'Jo', role: 'dev' }

    assertHasStringValues(record, ['name', 'role'])

    expect(record.name).toEqual('Jo')
  })

  it('Has more than required fields', () => {
    const record: unknown = { name: 'Jo', role: 'dev' }

    assertHasStringValues(record, ['name'])

    expect(record.name).toEqual('Jo')
  })

  it('Has less than required fields', () => {
    const record: unknown = { name: 'Jo' }

    expect(() => assertHasStringValues(record, ['name', 'role'])).toThrowError('Missing or invalid keys: role')
  })

  it('Has no required fields', () => {
    const record: unknown = {}

    expect(() => assertHasStringValues(record, ['name', 'role'])).toThrowError('Missing or invalid keys: name,role')
  })

  it('Is null', () => {
    const record: unknown = null

    expect(() => assertHasStringValues(record, ['name', 'role'])).toThrowError('Not a record')
  })

  it('Has empty fields', () => {
    const record: unknown = { name: '', role: '' }

    assertHasStringValues(record, ['name', 'role'])

    expect(record.name).toEqual('')
  })

  it('Has non-string fields', () => {
    const record: unknown = { name: 1, role: true }

    expect(() => assertHasStringValues(record, ['name', 'role'])).toThrowError('Missing or invalid keys: name,role')
  })

  it('Has null fields', () => {
    const record: unknown = { name: null, role: 'true' }

    expect(() => assertHasStringValues(record, ['name', 'role'])).toThrowError('Missing or invalid keys: name')
  })

  it('Has undefined fields', () => {
    const record: unknown = { name: undefined, role: 'true' }

    expect(() => assertHasStringValues(record, ['name', 'role'])).toThrowError('Missing or invalid keys: name')
  })
})

describe('assertHasOptionalStringValues', () => {
  it('Has required fields', () => {
    const record: unknown = { name: 'Jo', role: 'dev' }

    assertHasOptionalStringValues(record, ['name', 'role'])

    expect(record.name).toEqual('Jo')
  })

  it('Has more than required fields', () => {
    const record: unknown = { name: 'Jo', role: 'dev' }

    assertHasOptionalStringValues(record, ['name'])

    expect(record.name).toEqual('Jo')
  })

  it('Has less than required fields', () => {
    const record: unknown = { name: 'Jo' }

    assertHasOptionalStringValues(record, ['name', 'role'])

    expect(record.name).toBe('Jo')
    expect(record.role).toBe(undefined)
  })

  it('Has no required fields', () => {
    const record: unknown = {}

    assertHasOptionalStringValues(record, ['name', 'role'])

    expect(record.name).toEqual(undefined)
  })

  it('Is null', () => {
    const record: unknown = null

    expect(() => assertHasOptionalStringValues(record, ['name', 'role'])).toThrowError('Not a record')
  })

  it('Has empty fields', () => {
    const record: unknown = { name: '', role: '' }

    assertHasOptionalStringValues(record, ['name', 'role'])

    expect(record.name).toEqual('')
  })

  it('Has non-string fields', () => {
    const record: unknown = { name: 1, role: true }

    expect(() => assertHasOptionalStringValues(record, ['name', 'role'])).toThrowError('Non string keys: name,role')
  })

  it('Has null fields', () => {
    const record: unknown = { name: null, role: 'true' }

    assertHasOptionalStringValues(record, ['name', 'role'])
  })

  it('Has undefined fields', () => {
    const record: unknown = { name: undefined, role: 'true' }

    assertHasOptionalStringValues(record, ['name', 'role'])

    expect(record.name).toBe(undefined)
    expect(record.role).toBe('true')
  })
})

describe('Forename to initial', () => {
  it('should return null', () => {
    expect(forenameToInitial('')).toEqual(null)
  })
  it('should change forename to initial', () => {
    expect(forenameToInitial('Robert Smith')).toEqual('R. Smith')
  })
  it('should change forename to initial hypenated last name', () => {
    expect(forenameToInitial('Robert Smith-Jones')).toEqual('R. Smith-Jones')
  })
})
