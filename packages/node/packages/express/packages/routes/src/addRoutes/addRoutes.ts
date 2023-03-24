import { Express } from 'express'

import { addDomainRoutes } from './addDomainRoutes'
import { addMetricsRoutes } from './addMetricsRoutes'
import { addNodeRoutes } from './addNodeRoutes'
import { addTempNodeRoutes } from './addTempNodeRoutes'

export const addRoutes = (app: Express): Express => {
  addDomainRoutes(app)
  addTempNodeRoutes(app)
  addMetricsRoutes(app)
  // This needs to be the last true route handler since it is
  // a catch-all for the root paths
  addNodeRoutes(app)
  return app
}
