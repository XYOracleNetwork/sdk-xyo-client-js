import { Express } from 'express'

import { getDomain } from '../routes'

export const addDomainRoutes = (app: Express) => {
  app.get(
    '/domain/:domain',
    getDomain,
    /* #swagger.tags = ['Domain'] */
    /* #swagger.summary = 'Get specific config for a specific domain' */
  )
}
