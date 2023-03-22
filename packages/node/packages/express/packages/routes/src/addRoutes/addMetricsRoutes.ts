import { adminApiKeyStrategy, allowAnonymous, isDevelopment } from '@xyo-network/express-node-middleware'
import { Express } from 'express'

import { getMetrics } from '../routes'

export const addMetricsRoutes = (app: Express) => {
  app.get(
    '/healthz',
    allowAnonymous,
    (req, res) => {
      const data = {
        date: new Date(),
        message: 'Ok',
        uptime: process.uptime(),
      }
      res.status(200).send(data)
    },
    /* #swagger.tags = ['Health'] */
    /* #swagger.summary = 'Used for quick health check' */
  )
  app.get(
    '/metrics',
    isDevelopment() ? allowAnonymous : adminApiKeyStrategy,
    getMetrics /* #swagger.tags = ['Node'] */,
    /* #swagger.summary = 'Gets modules on the Node' */
  )
}
