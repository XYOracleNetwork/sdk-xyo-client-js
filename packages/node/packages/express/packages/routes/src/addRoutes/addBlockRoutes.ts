import { Express } from 'express'

import { postArchiveBlock } from '../routes'

export const addBlockRoutes = (app: Express) => {
  app.post(
    '/archive/:archive/block',
    // requireArchiveAccess,
    postArchiveBlock,
    /* #swagger.tags = ['Block'] */
    /* #swagger.summary = 'Post blocks' */
  )

  app.post(
    '/archive/:archive/bw',
    // requireArchiveAccess,
    postArchiveBlock,
    /* #swagger.tags = ['Block'] */
    /* #swagger.deprecated = true */
    /* #swagger.summary = 'Temporary support for legacy calls' */
  )
}
