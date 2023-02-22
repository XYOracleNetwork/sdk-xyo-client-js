import { allowAnonymous } from '@xyo-network/express-node-middleware'
import { Express } from 'express'

import { getAddress, postAddress } from '../routes'

export const addTempNodeRoutes = (app: Express) => {
  // TODO: Allow other default modules to be mounted at root
  const defaultModule = app.node
  const address = defaultModule.address
  const defaultModuleEndpoint = `/node/${address}`
  app.get('/node', allowAnonymous, (_req, res) => res.redirect(defaultModuleEndpoint))
  app.post('/node', allowAnonymous, (_req, res) => res.redirect(defaultModuleEndpoint))
  app.get('/node/:address', allowAnonymous, getAddress)
  app.post('/node/:address', allowAnonymous, postAddress)
}
