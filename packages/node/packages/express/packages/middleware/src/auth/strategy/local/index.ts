import passport from 'passport'

export const localStrategyName = 'local'
export const localStrategy = passport.authenticate(localStrategyName, { session: false })

export * from './LocalStrategy'
