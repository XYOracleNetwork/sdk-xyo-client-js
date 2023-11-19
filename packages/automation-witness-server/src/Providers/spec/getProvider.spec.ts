import { getProvider } from '../getProvider'

/**
 * @group crypto
 * @group infura
 * @group slow
 */

describe('getProvider', () => {
  beforeEach(() => {
    process.env.INFURA_PROJECT_ID = 'foo'
    process.env.INFURA_PROJECT_SECRET = 'bar'
  })
  describe('with default provider', () => {
    it('returns a Provider', () => {
      const provider = getProvider()
      expect(provider).toBeDefined()
      expect(provider).toBeTruthy()
    })
    it('returns Infra Provider if config available', () => {
      const provider = getProvider()
      expect(provider).toBeDefined()
      expect(provider).toBeTruthy()
    })
    it('returns empty for Infra Provider if config not available', () => {
      delete process.env.INFURA_PROJECT_ID
      delete process.env.INFURA_PROJECT_SECRET
      const provider = getProvider()
      expect(provider).toBeDefined()
      expect(provider).toBeTruthy()
    })
  })
  describe('with Infura Provider', () => {
    it('returns a Provider', () => {
      const provider = getProvider()
      expect(provider).toBeDefined()
      expect(provider).toBeTruthy()
    })
  })
})
