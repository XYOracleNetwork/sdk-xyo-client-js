import { ExpressError } from '@xylabs/sdk-api-express-ecs'
import { Logger } from '@xyo-network/shared'
import { ErrorRequestHandler, NextFunction, Request, Response } from 'express'

type PossibleError = ExpressError | Error

export const getLoggingErrorHandler = (logger: Logger): ErrorRequestHandler => {
  return (err: PossibleError, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      return next()
    }
    // Logs any errors issued by our code via next({statusCode: 500, message: 'Internal Server Error'})
    const statusCode = (err as ExpressError)?.statusCode
    if (statusCode && err?.message) {
      if (statusCode > 499) {
        logger.error(err?.message)
      } else if (statusCode > 399) {
        logger.warn(err?.message)
      }
      // Logs an uncaught errors thrown by DB query, for example
    } else if (err instanceof Error) {
      logger.error(err.message)
    }
    return next(err)
  }
}
