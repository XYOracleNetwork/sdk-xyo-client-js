import { RequestHandler } from 'express'
import passport from 'passport'

import {
  adminApiKeyStrategy,
  allowUnauthenticatedStrategyName,
  archiveAccountStrategy,
  archiveApiKeyStrategy,
  archiveApiKeyStrategyName,
  archiveOwnerStrategy,
  jwtStrategy,
  jwtStrategyName,
} from './strategy'

/**
 * Require an Archive API Key in the appropriate request header
 */
export const requireArchiveApiKey: RequestHandler = archiveApiKeyStrategy

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
export const requireAuth: RequestHandler = passport.authenticate([jwtStrategyName, archiveApiKeyStrategyName], {
  session: false,
})

/**
 * Require an auth'd request AND that the account owns the archive being requested
 */
export const requireArchiveOwner: RequestHandler[] = [requireAuth, archiveOwnerStrategy]

/**
 * If present, require API key OR JWT to be valid, but if absent, allow anonymous access
 */
export const allowAnonymous: RequestHandler = passport.authenticate([jwtStrategyName, archiveApiKeyStrategyName, allowUnauthenticatedStrategyName], {
  session: false,
})

/**
 * Require that the user can, in some way, access the archive. Either by owning
 * the archive OR by the archive being public (having no access control)
 */
// export const requireArchiveAccess: RequestHandler[] = [allowAnonymous, archiveAccessControlStrategy]
export const requireArchiveAccess: RequestHandler[] = [allowAnonymous, archiveAccountStrategy]

/**
 * Require that both the address and schema are allowed on the archive
 */
export const requireAccountOperationAccess: RequestHandler[] = [allowAnonymous, archiveAccountStrategy]
