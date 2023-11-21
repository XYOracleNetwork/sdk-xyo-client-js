import yargs from 'yargs'

import config from '../config'

describe('config', () => {
  const parser = yargs().command(config).help()
  it('requires arguments', async () => {
    const output = await new Promise((resolve) => {
      void parser.parse('config', (err: unknown, argv: unknown, output: unknown) => {
        resolve(output)
      })
    })
    expect(output).toContain('Not enough non-option arguments')
  })
})
