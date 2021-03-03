import { assertHasOptionalStringValues } from '../../utils'

export type RoomAndComment = {
  preLocation?: number
  mainLocation: number
  postLocation?: number
  comment: string
}

export function RoomAndComment(form: unknown): RoomAndComment {
  assertHasOptionalStringValues(form, ['preLocation', 'mainLocation', 'postLocation', 'comment'])

  return {
    preLocation: form.preLocation ? parseInt(form.preLocation, 10) : null,
    mainLocation: parseInt(form.mainLocation, 10),
    postLocation: form.postLocation ? parseInt(form.postLocation, 10) : null,
    comment: form.comment,
  }
}
