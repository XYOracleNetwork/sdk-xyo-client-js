import { canUseInfuraProvider, getInfuraProvider, getInfuraProviderConfig } from './getInfuraProvider'

describe('getInfuraProvider', () => {
  beforeEach(() => {
    process.env.INFURA_PROJECT_ID = 'foo'
    process.env.INFURA_PROJECT_SECRET = 'bar'
  })
  describe('getInfuraProvider', () => {
    it('returns a Provider', () => {
      if (canUseInfuraProvider()) {
        const provider = getInfuraProvider()
        expect(provider).toBeDefined()
        expect(provider).toBeTruthy()
        expect(provider._isProvider).toBeTruthy()
      }
    })
    it('returns a cached provider on subsequent invocations', () => {
      if (canUseInfuraProvider()) {
        const providerA = getInfuraProvider()
        const providerB = getInfuraProvider()
        expect(providerA).toBe(providerB)
      }
    })
  })
  describe('canUseProvider', () => {
    it('returns true if projectId/secret are defined in ENV', () => {
      const canUse = canUseInfuraProvider()
      expect(canUse).toBeDefined()
      expect(canUse).toBeTruthy()
    })
    it('returns false if projectId is not defined in ENV', () => {
      delete process.env.INFURA_PROJECT_ID
      const canUse = canUseInfuraProvider()
      expect(canUse).toBeDefined()
      expect(canUse).toBeFalsy()
    })
    it('returns false if projectSecret is not defined in ENV', () => {
      delete process.env.INFURA_PROJECT_SECRET
      const canUse = canUseInfuraProvider()
      expect(canUse).toBeDefined()
      expect(canUse).toBeFalsy()
    })
  })
  describe('getProviderConfig', () => {
    it('returns boolean indicating the provider can be used', () => {
      if (canUseInfuraProvider()) {
        const config = getInfuraProviderConfig()
        expect(config).toBeDefined()
        expect(config).toBeTruthy()
        expect(config.projectId).toBeTruthy()
      }
    })
  })
})
