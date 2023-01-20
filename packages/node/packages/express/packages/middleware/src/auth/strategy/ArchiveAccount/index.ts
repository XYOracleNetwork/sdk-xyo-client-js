import passport from 'passport'

export const archiveAccountStrategyName = 'archiveAccount'
export const archiveAccountStrategy = passport.authenticate(archiveAccountStrategyName, { session: false })

export * from './archiveAccountStrategy'
