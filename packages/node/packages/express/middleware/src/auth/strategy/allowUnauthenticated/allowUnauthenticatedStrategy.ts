import { Request } from 'express'
import { Strategy, StrategyCreated, StrategyCreatedStatic } from 'passport'

/**
 * Authentication scheme which allows for unauthenticated requests for use in
 * routes which provide a satisfactory experience without being logged in but
 * could also provide a richer experience for users who are logged in. If auth
 * is supplied via API Key or Authorization header, this strategy will fail in
 * deference to those strategies, allowing those strategies to take precedence
 * if supplied.
 */
export class AllowUnauthenticatedStrategy extends Strategy {
  constructor(public readonly apiKeyHeader = 'x-api-key') {
    super()
  }

  override authenticate(this: StrategyCreated<this, this & StrategyCreatedStatic>, req: Request, _options?: unknown) {
    try {
      // NOTE: There should never be multiple of this header but
      // just to prevent ugliness if someone did send us multiple
      // we'll grab the 1st one
      const apiKey =
        // If the header exists
        req.headers[this.apiKeyHeader]
          ? // If there's multiple of the same header
            Array.isArray(req.headers[this.apiKeyHeader])
            ? // Grab the first one
              (req.headers[this.apiKeyHeader] as string[]).shift()
            : // Otherwise grab the only one
              (req.headers[this.apiKeyHeader] as string)
          : // Otherwise undefined
            undefined
      if (apiKey) {
        this.fail('API key header supplied')
        return
      }

      const authHeader = req.headers.authorization
      if (authHeader) {
        this.fail('Authorization header supplied')
        return
      }

      this.success(req.user || {})
      return
    } catch (error) {
      this.error({ message: 'AllowUnauthenticated Auth Error' })
    }
  }
}
