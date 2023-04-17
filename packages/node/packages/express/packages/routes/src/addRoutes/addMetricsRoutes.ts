import { isDevelopment } from '@xyo-network/express-node-middleware'
import { Express } from 'express'

import { getHealthz, getMetrics } from '../routes'
export const addMetricsRoutes = (app: Express) => {
  app.get(
    '/healthz',
    getHealthz,
    /* #swagger.tags = ['Health'] */
    /* #swagger.summary = 'Used for quick health check' */
  )
  if (isDevelopment()) {
    app.get(
      '/metrics',
      getMetrics /* #swagger.tags = ['Node'] */,
      /* #swagger.summary = 'Gets modules on the Node' */
    )
  }
  app.get(
    '/ready',
    // TODO: Custom endpoint as readiness !== health
    getHealthz,
    /* #swagger.tags = ['Health'] */
    /* #swagger.summary = 'Used for readiness check' */
  )
}
