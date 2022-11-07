import { notImplemented } from '@xylabs/sdk-api-express-ecs'
import { allowAnonymous } from '@xyo-network/express-node-middleware'
import { Express } from 'express'

import { getSchema } from '../routes'

export const addSchemaRoutes = (app: Express) => {
  app.get(
    '/schema',
    allowAnonymous,
    notImplemented,
    /* #swagger.deprecated = true */
    /* #swagger.tags = ['Schema'] */
    /* #swagger.summary = 'Get list of known schemas on archivist' */
  )

  app.get(
    '/schema/:schema',
    allowAnonymous,
    getSchema,
    /* #swagger.tags = ['Schema'] */
    /* #swagger.summary = 'Get specific schema if known by archivist' */
  )
}
