import { hashFile } from '../hashFile'
describe('hashFile', () => {
  describe('with existing file', () => {
    const expected = '5359b8ebfd4e9251c27a40cc12e64a4cc182e8cfacafc53d2e0c591651d4cc42'
    it('hashes file by path', async () => {
      const file = `${__dirname}/test.txt`
      const actual = await hashFile(file)
      expect(actual).toEqual(expected)
    })
    it('hashes file by file URI', async () => {
      const file = `file://${__dirname}/test.txt`
      const actual = await hashFile(file)
      expect(actual).toEqual(expected)
    })
  })
})
