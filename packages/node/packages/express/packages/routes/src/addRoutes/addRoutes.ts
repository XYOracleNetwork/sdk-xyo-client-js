import { Express } from 'express'

import { addAddressRoutes } from './addAddressRoutes'
import { addArchiveRoutes } from './addArchiveRoutes'
import { addBlockRoutes } from './addBlockRoutes'
import { addManagementRoutes } from './addManagementRoutes'
import { addNodeRoutes } from './addNodeRoutes'
import { addTempNodeRoutes } from './addTempNodeRoutes'

export const addRoutes = (app: Express): Express => {
  addAddressRoutes(app)
  addArchiveRoutes(app)
  addBlockRoutes(app)
  addManagementRoutes(app)
  addTempNodeRoutes(app)
  // This needs to be the last true route handler since it is
  // a catch-all for the root paths
  addNodeRoutes(app)
  return app
}
