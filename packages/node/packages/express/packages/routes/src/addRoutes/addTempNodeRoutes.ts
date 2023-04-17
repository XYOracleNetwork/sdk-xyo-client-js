import { Express } from 'express'
import { StatusCodes } from 'http-status-codes'

import { getAddress, postAddress } from '../routes'

export const addTempNodeRoutes = (app: Express) => {
  const defaultModule = app.node
  const address = defaultModule.address
  const defaultModuleEndpoint = `/node/${address}`
  app.get('/node', (_req, res) => res.redirect(StatusCodes.MOVED_TEMPORARILY, defaultModuleEndpoint))
  app.post('/node', (_req, res) => res.redirect(StatusCodes.TEMPORARY_REDIRECT, defaultModuleEndpoint))
  app.get('/node/:address', getAddress)
  app.post('/node/:address', postAddress)
}
