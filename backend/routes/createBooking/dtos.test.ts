import { RoomAndComment } from './dtos'

describe('RoomAndComment', () => {
  test('check parse', () => {
    const result = RoomAndComment({
      preLocation: '20',
      mainLocation: '10',
      postLocation: '30',
      comment: 'A comment',
    })

    expect(result).toStrictEqual({
      preLocation: 20,
      mainLocation: 10,
      postLocation: 30,
      comment: 'A comment',
    })
  })

  test('check optional fields', () => {
    const result = RoomAndComment({
      mainLocation: '10',
      postLocation: '30',
    })

    expect(result).toStrictEqual({
      preLocation: null,
      mainLocation: 10,
      postLocation: 30,
      comment: undefined,
    })
  })

  test('check valid types', () => {
    expect(() =>
      RoomAndComment({
        mainLocation: ['10'],
        postLocation: '30',
        comment: [],
      })
    ).toThrowError('Non string keys: mainLocation,comment')
  })
})
