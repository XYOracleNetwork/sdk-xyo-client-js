import passport from 'passport'

export const archiveApiKeyStrategyName = 'archiveApiKey'
export const archiveApiKeyStrategy = passport.authenticate(archiveApiKeyStrategyName, { session: false })

export * from './archiveApiKeyStrategy'
