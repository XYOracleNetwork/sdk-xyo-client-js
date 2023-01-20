import { Express } from 'express'

import { addAddressRoutes } from './addAddressRoutes'
import { addArchiveRoutes } from './addArchiveRoutes'
import { addBlockRoutes } from './addBlockRoutes'
import { addDomainRoutes } from './addDomainRoutes'
import { addManagementRoutes } from './addManagementRoutes'
import { addNodeRoutes } from './addNodeRoutes'
import { addPayloadRoutes } from './addPayloadRoutes'
import { addPayloadSchemaRoutes } from './addPayloadSchemaRoutes'
import { addSchemaRoutes } from './addSchemaRoutes'

export const addRoutes = (app: Express): Express => {
  addAddressRoutes(app)
  addArchiveRoutes(app)
  addBlockRoutes(app)
  addPayloadRoutes(app)
  addPayloadSchemaRoutes(app)
  addManagementRoutes(app)
  addSchemaRoutes(app)
  addDomainRoutes(app)
  // This needs to be the last true route handler since it is
  // a catch-all for the root paths
  addNodeRoutes(app)
  return app
}
