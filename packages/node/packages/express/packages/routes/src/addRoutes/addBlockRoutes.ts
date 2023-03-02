import { notImplemented } from '@xylabs/sdk-api-express-ecs'
import { requireArchiveAccess } from '@xyo-network/express-node-middleware'
import { Express } from 'express'

import {
  getArchiveBlockRecent,
  postArchiveBlock,
} from '../routes'

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

  if (app.get('addLegacyRoutes')) {
    app.get(
      '/archive/:archive/block/recent/:limit?',
      requireArchiveAccess,
      getArchiveBlockRecent,
      /* #swagger.tags = ['Block'] */
      /* #swagger.summary = 'Get the most recent blocks' */
    )

    app.get(
      '/archive/:archive/block/sample/:size?',
      requireArchiveAccess,
      notImplemented,
      /* #swagger.deprecated = true */
      /* #swagger.tags = ['Block'] */
      /* #swagger.summary = 'Get a random sampling of blocks' */
    )

    app.get(
      '/archive/:archive/block/chain/:hash/:address/:limit?',
      requireArchiveAccess,
      notImplemented,
      /* #swagger.deprecated = true */
      /* #swagger.tags = ['Block'] */
      /* #swagger.summary = 'Get a proof of origin chain starting from a block hash' */
    )
  }
}
