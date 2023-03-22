import { adminApiKeyStrategy, allowAnonymous, isDevelopment } from '@xyo-network/express-node-middleware'
import { Express } from 'express'
import { ReasonPhrases } from 'http-status-codes'

import { getMetrics } from '../routes'
const message = ReasonPhrases.OK
export const addMetricsRoutes = (app: Express) => {
  app.get(
    '/healthz',
    allowAnonymous,
    (req, res) => {
      const date = new Date()
      const { cpuUsage, memoryUsage, uptime } = process
      const data = { cpuUsage, date, memoryUsage, message, uptime }
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
