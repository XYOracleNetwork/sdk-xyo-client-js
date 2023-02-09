import yargs from 'yargs'

import get from '../get'

describe('get', () => {
  const parser = yargs().command(get).help()
  it('requires arguments', async () => {
    const output = await new Promise((resolve) => {
      void parser.parse('get', (err: unknown, argv: unknown, output: unknown) => {
        resolve(output)
      })
    })
    expect(output).toContain('Not enough non-option arguments')
  })
})
