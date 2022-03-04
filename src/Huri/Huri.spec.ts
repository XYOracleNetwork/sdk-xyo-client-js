import { Huri } from './Huri'

const hash = 'fb3606d71dcdd49a0aacc9d234e412684d577803c8a9ed9399a9d3776cc88e24'

const valid = [
  `https://${hash}`,
  `https://api.archivist.xyo.network/${hash}`,
  `http://api.archivist.xyo.network/${hash}`,
  `/api.archivist.xyo.network/${hash}`,
  `//${hash}`,
  `/${hash}`,
  `${hash}`,
]

const invalid = [
  `https://api.archivist.xyo.network/block/${hash}`,
  `https:///api.archivist.xyo.network/${hash}`,
  `https://api.archivist.xyo.network//${hash}`,
  `api.archivist.xyo.network/block/${hash}`,
]

describe('Huri', () => {
  valid.map((item) => {
    test(`valid [${item}]`, () => {
      try {
        const huri = new Huri(item)
        expect(huri.hash).toBe(hash)
      } catch (ex) {
        console.error(`Valid Huri failed: [${item}]`)
        console.error(ex)
      }
    })
  })
  invalid.map((item) => {
    test(`invalid [${item}]`, () => {
      expect(() => new Huri(item)).toThrowError()
    })
  })
})
