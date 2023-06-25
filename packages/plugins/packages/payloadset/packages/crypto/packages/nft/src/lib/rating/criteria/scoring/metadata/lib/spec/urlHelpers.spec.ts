import { isSecure, isValidUrl, isWeb2, isWeb3, toUrl } from '../urlHelpers'

const ipfsUrl = 'ipfs://QmRyBBrLYWy6zZRyDUR5JWLJ2mrbvHFtptosrM3jAwBXTc/'
const httpUrl = 'http://www.google.com'
const httpsUrl = 'https://xyo.network'

const validUrls = [httpUrl, httpsUrl, ipfsUrl]
const invalidUrls = [undefined, null, 'not a url', 'https://']

describe('toUrl', () => {
  describe('with valid url', () => {
    it.each(validUrls)('parses the URL', (url) => {
      const parsed = toUrl(url)
      expect(parsed).toBeObject()
      expect(parsed?.host).toBeString()
      expect(parsed?.hostname).toBeString()
      expect(parsed?.protocol).toBeString()
    })
  })
  describe('with invalid url', () => {
    it.each(invalidUrls)('returns undefined', (url) => {
      const parsed = toUrl(url)
      expect(parsed).toBeUndefined()
    })
  })
})

describe('isValidUrl', () => {
  describe('with valid url', () => {
    it.each(validUrls)('returns true', (url) => {
      const parsed = isValidUrl(url)
      expect(parsed).toBeTrue()
    })
  })
  describe('with invalid url', () => {
    it.each(invalidUrls)('returns false', (url) => {
      const parsed = isValidUrl(url)
      expect(parsed).toBeFalse()
    })
  })
})

describe('isWeb3', () => {
  describe('with ipfs url', () => {
    it('returns true', () => {
      const parsed = isWeb3(ipfsUrl)
      expect(parsed).toBeTrue()
    })
  })
  describe('with https url', () => {
    it.each([httpUrl, httpsUrl])('returns false', (url) => {
      const parsed = isWeb3(url)
      expect(parsed).toBeFalse()
    })
  })
})

describe('isWeb2', () => {
  describe('with ipfs url', () => {
    it('returns false', () => {
      const parsed = isWeb2(ipfsUrl)
      expect(parsed).toBeFalse()
    })
  })
  describe('with https url', () => {
    it.each([httpUrl, httpsUrl])('returns true', (url) => {
      const parsed = isWeb2(url)
      expect(parsed).toBeTrue()
    })
  })
})

describe('isSecure', () => {
  describe('with https url', () => {
    it('returns true', () => {
      const parsed = isSecure(httpsUrl)
      expect(parsed).toBeTrue()
    })
  })
  describe('with ipfs url', () => {
    it('returns true', () => {
      const parsed = isSecure(ipfsUrl)
      expect(parsed).toBeTrue()
    })
  })
  describe('with http url', () => {
    it('returns false', () => {
      const parsed = isSecure(httpUrl)
      expect(parsed).toBeFalse()
    })
  })
})
