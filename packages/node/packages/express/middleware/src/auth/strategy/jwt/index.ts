import passport from 'passport'

export const jwtStrategyName = 'jwt'
export const jwtStrategy = passport.authenticate(jwtStrategyName, { session: false })

export * from './JwtStrategy'
