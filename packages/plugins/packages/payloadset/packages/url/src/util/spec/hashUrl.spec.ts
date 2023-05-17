import { hashUrl } from '../hashUrl'

describe('hashUrl', () => {
  describe('with https URL', () => {
    it('hashes resource', async () => {
      const url = 'https://xyo.network/favicon.ico'
      const actual = await hashUrl(url)
      expect(actual).toBeTruthy()
    })
  })
  describe('with file URL', () => {
    it('hashes resource', async () => {
      const url = `file://${__dirname}/test.txt`
      const actual = await hashUrl(url)
      expect(actual).toBeTruthy()
    })
  })
})
