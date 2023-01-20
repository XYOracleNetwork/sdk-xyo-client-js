import passport from 'passport'

export const archiveOwnerStrategyName = 'archiveOwner'
export const archiveOwnerStrategy = passport.authenticate(archiveOwnerStrategyName, { session: false })

export * from './archiveOwnerStrategy'
