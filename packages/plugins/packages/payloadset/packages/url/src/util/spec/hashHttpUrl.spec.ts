import { hashHttpUrl } from '../hashHttpUrl'

describe('hashHttpUrl', () => {
  describe('with existing URL', () => {
    const uri = 'xyo.network/favicon.ico'
    it('hashes http URLs', async () => {
      const expected = '7f5007068d2b56ea9735e2490d60cff2e72cae312024ac1f6c91158eba47d05d'
      const url = `http://${uri}`
      const actual = await hashHttpUrl(url)
      expect(actual).toEqual(expected)
    })
    it('hashes https URLs', async () => {
      const expected = '5b6fb901d981dd1da84844069c3eb5aaf725a4f23e40613751eecd5ca0bc4060'
      const url = `https://${uri}`
      const actual = await hashHttpUrl(url)
      expect(actual).toEqual(expected)
    })
  })
  describe('with non-existent URL', () => {
    it('throws', () => {
      expect(() => hashHttpUrl('missing.txt')).rejects.toThrow()
    })
  })
})
