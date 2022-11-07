import { requireAdminApiKey } from '@xyo-network/express-node-middleware'
import { Express } from 'express'

import { postMigratePermissionsArchive, postMigratePermissionsArchives } from '../routes'

export const addManagementRoutes = (app: Express) => {
  app.post(
    '/management/migrate/permissions/archives',
    requireAdminApiKey,
    postMigratePermissionsArchives,
    /* #swagger.tags = ['Management'] */
    /* #swagger.ignore = true */
    /* #swagger.summary = 'Migrate multiple archives from using legacy permissions objects to new Payload-based permissions' */
  )
  app.post(
    '/management/migrate/permissions/archives/:archive',
    requireAdminApiKey,
    postMigratePermissionsArchive,
    /* #swagger.tags = ['Management'] */
    /* #swagger.ignore = true */
    /* #swagger.summary = 'Migrate a single archive from using legacy permissions to new Payload-based permissions' */
  )
}
