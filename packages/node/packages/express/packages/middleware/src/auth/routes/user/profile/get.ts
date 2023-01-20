import 'source-map-support/register'

import { RequestHandler } from 'express'

import { toUserDto } from '../../../dto'

export const getUserProfile: RequestHandler = (req, res) => {
  const user = toUserDto(req.user)
  res.json({
    user,
  })
}
