import passport from 'passport'

export const allowUnauthenticatedStrategyName = 'allowUnauthenticated'
export const allowUnauthenticatedStrategy = passport.authenticate(allowUnauthenticatedStrategyName, { session: false })

export * from './allowUnauthenticatedStrategy'
