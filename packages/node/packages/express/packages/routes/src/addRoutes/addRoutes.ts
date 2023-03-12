import { Express } from 'express'

import { addAddressRoutes } from './addAddressRoutes'
import { addDomainRoutes } from './addDomainRoutes'
import { addNodeRoutes } from './addNodeRoutes'
import { addTempNodeRoutes } from './addTempNodeRoutes'

export const addRoutes = (app: Express): Express => {
  addAddressRoutes(app)
  addDomainRoutes(app)
  addTempNodeRoutes(app)
  // This needs to be the last true route handler since it is
  // a catch-all for the root paths
  addNodeRoutes(app)
  return app
}
