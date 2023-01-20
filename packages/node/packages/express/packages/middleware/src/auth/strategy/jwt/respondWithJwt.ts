import { assertEx } from '@xylabs/assert'
import { RequestHandler } from 'express'
import { StatusCodes } from 'http-status-codes'
import { SignOptions } from 'jsonwebtoken'

import { toUserDto } from '../../dto'
import { signJwt } from './signJwt'

export const defaultJwtAlgorithm = 'HS256' // 'HS512' once we perf
export const defaultJwtAudience = 'archivist'
export const defaultJwtIssuer = 'archivist'
export const defaultJwtExpiration = '1 day'

export const defaultSignOptions: SignOptions = {
  algorithm: defaultJwtAlgorithm,
  audience: defaultJwtAudience,
  expiresIn: defaultJwtExpiration,
  issuer: defaultJwtIssuer,
}

export const getJwtRequestHandler = (secretOrKey: string, opts: SignOptions = defaultSignOptions): RequestHandler => {
  const secret: string = assertEx(secretOrKey, 'JWT Secret must be supplied')
  const respondWithJwt: RequestHandler = (req, res, next) => {
    try {
      const { user } = req
      if (!user || !user?.id) {
        next({ message: 'Invalid User', statusCode: StatusCodes.UNAUTHORIZED })
        return
      }
      req.login(user, { session: false }, async (error) => {
        if (error) {
          return next(error)
        }
        const options: SignOptions = { ...defaultSignOptions, ...opts, subject: user.id }
        const token = await signJwt(toUserDto(user), secret, options)
        res.json({ token })
        return
      })
    } catch (error) {
      next(error)
      return
    }
  }
  return respondWithJwt
}
