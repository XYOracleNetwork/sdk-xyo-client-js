import { hashHttpUrl } from '../hashHttpUrl'

describe('hashHttpUrl', () => {
  describe('with existing URL', () => {
    it('hashes http URLs', async () => {
      // TODO: Replace with a more static http URL
      const expected = '6da5620880159634213e197fafca1dde0272153be3e4590818533fab8d040770'
      const url = 'http://www.google.com/favicon.ico'
      const actual = await hashHttpUrl(url)
      expect(actual).toEqual(expected)
    })
    it('hashes https URLs', async () => {
      const expected = '5b6fb901d981dd1da84844069c3eb5aaf725a4f23e40613751eecd5ca0bc4060'
      const url = 'https://xyo.network/favicon.ico'
      const actual = await hashHttpUrl(url)
      expect(actual).toEqual(expected)
    })
  })
  describe('with non-existent URL', () => {
    it('throws', () => {
      expect(() => hashHttpUrl('https://foo.bar.baz.quix/missing.txt')).rejects.toThrow()
    })
  })
})
