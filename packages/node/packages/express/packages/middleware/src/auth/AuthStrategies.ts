import { RequestHandler } from 'express'
import passport from 'passport'

import { adminApiKeyStrategy, allowUnauthenticatedStrategyName, jwtStrategy, jwtStrategyName } from './strategy'

/**
 * Require an Archive API Key in the appropriate request header
 */
export const requireAdminApiKey: RequestHandler = adminApiKeyStrategy

/**
 * Require logged-in user as evidenced by a JWT in the request Auth header
 */
export const requireLoggedIn: RequestHandler = jwtStrategy

/**
 * Require either an API key OR logged-in user
 */
export const requireAuth: RequestHandler = passport.authenticate([jwtStrategyName], {
  session: false,
})

/**
 * If present, require API key OR JWT to be valid, but if absent, allow anonymous access
 */
export const allowAnonymous: RequestHandler = passport.authenticate([jwtStrategyName, allowUnauthenticatedStrategyName], {
  session: false,
})
