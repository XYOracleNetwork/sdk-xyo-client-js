import { notImplemented } from '@xylabs/sdk-api-express-ecs'
import { allowAnonymous, requireArchiveAccess, requireArchiveOwner, requireAuth } from '@xyo-network/express-node-middleware'
import { Express } from 'express'

import { getArchive, getArchives, putArchive } from '../routes'
import { addArchiveSettingsRoutes } from './addArchiveSettingsRoutes'

const addLegacyRoutes = true

export const addArchiveRoutes = (app: Express) => {
  app.get(
    '/archive',
    allowAnonymous,
    getArchives,
    /* #swagger.tags = ['Archive'] */
    /* #swagger.summary = 'Get list of archives on archivist' */
  )

  app.get(
    '/archive/:archive',
    requireArchiveAccess,
    getArchive,
    /* #swagger.tags = ['Archive'] */
    /* #swagger.summary = 'Get archive configuration' */
  )

  app.put(
    '/archive/:archive',
    requireAuth,
    putArchive,
    /* #swagger.tags = ['Archive'] */
    /* #swagger.summary = 'Put archive configuration' */
  )

  app.delete(
    '/archive/:archive',
    requireArchiveOwner,
    notImplemented,
    /* #swagger.deprecated = true */
    /* #swagger.tags = ['Archive'] */
    /* #swagger.summary = 'Delete an archive' */
  )
  addArchiveSettingsRoutes(app)
}
