import { allowAnonymous } from '@xyo-network/express-node-middleware'
import { Express } from 'express'

import { getDomain } from '../routes'

export const addDomainRoutes = (app: Express) => {
  app.get(
    '/domain/:domain',
    allowAnonymous,
    getDomain,
    /* #swagger.tags = ['Domain'] */
    /* #swagger.summary = 'Get specific config for a specific domain' */
  )
}
