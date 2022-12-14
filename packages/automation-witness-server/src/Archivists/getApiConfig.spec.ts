import { getApiConfig } from './getApiConfig'

describe('getApiConfig', () => {
  it('returns the API config from the ENV', () => {
    const config = getApiConfig()
    expect(config).toBeTruthy()
    expect(config.apiDomain).toBeDefined()
  })
  it('returns the API config for beta if no ENV', () => {
    delete process.env.ARCHIVIST_API_DOMAIN
    const config = getApiConfig()
    expect(config).toBeTruthy()
    expect(config.apiDomain).toBeDefined()
  })
})
