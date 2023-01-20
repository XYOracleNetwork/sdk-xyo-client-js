import 'source-map-support/register'

import { RequestHandler } from 'express'
import { StatusCodes } from 'http-status-codes'
import { v1 } from 'uuid'

export const postAccountChallenge: RequestHandler = (req, res) => {
  const { address } = req.params
  if (!address) {
    res.sendStatus(StatusCodes.BAD_REQUEST)
    return
  }
  // NOTE: So that we don't have to store these somewhere to verify we actually
  // generated them, we use a UUIDv1 which includes a time we can verify is
  // within a reasonable window later.
  const state = v1()
  res.json({ state })
}
