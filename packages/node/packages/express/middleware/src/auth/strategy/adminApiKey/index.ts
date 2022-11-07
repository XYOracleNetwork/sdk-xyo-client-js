import passport from 'passport'

export const adminApiKeyStrategyName = 'adminApiKey'
export const adminApiKeyStrategy = passport.authenticate(adminApiKeyStrategyName, { session: false })

export * from './adminApiKeyStrategy'
