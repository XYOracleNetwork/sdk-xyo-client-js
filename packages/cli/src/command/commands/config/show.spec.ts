import yargs from 'yargs'

import sut, { command } from './show'

describe('show', () => {
  let output = ''
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation((out) => (output = out))
  })
  describe('with no config', () => {
    it('returns default empty config object', async () => {
      const parser = yargs([command]).command(sut)
      await parser.parse(command)
      expect(output).toBeString()
      const parsed = JSON.parse(output)
      expect(parsed).toBeObject()
    })
  })
})
