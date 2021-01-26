import { CookieOptions, Response, Request } from 'express'
import config from '../../config'
import { Codec } from '../../utils'
import { ChangeDateAndTimeCodec } from './dtos'

export const cookieOptions: CookieOptions = {
  domain: config.hmppsCookie.domain,
  httpOnly: true,
  maxAge: config.hmppsCookie.expiryMinutes * 60 * 1000,
  sameSite: 'lax',
  secure: config.app.production,
  signed: true,
}

const clearState = (name: string) => (res: Response): void => {
  res.clearCookie(name, cookieOptions)
}

const setState = <T>(name: string, codec: Codec<T>) => (res: Response, data: T): void => {
  res.cookie(name, codec.write(data), cookieOptions)
}
const getState = <T>(name: string, codec: Codec<T>) => (req: Request): T | undefined => {
  const result = req.signedCookies[name]
  return result ? codec.read(result) : undefined
}

export const clearUpdate = clearState('booking-update')
export const setUpdate = setState('booking-update', ChangeDateAndTimeCodec)
export const getUpdate = getState('booking-update', ChangeDateAndTimeCodec)
