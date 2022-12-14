import { Express } from 'express'

export const addHealthChecks = (app: Express) => {
  app.get('/', (_req, res, next) => {
    /* #swagger.tags = ['Health'] */
    /* #swagger.summary = 'Get the health check for the server' */
    res.json({ alive: true })
    next()
  })
  return app
}
