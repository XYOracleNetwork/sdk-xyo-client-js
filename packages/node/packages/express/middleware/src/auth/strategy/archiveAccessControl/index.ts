import passport from 'passport'

export const archiveAccessControlStrategyName = 'archiveAccessControl'
export const archiveAccessControlStrategy = passport.authenticate(archiveAccessControlStrategyName, { session: false })

export * from './archiveAccessControlStrategy'
