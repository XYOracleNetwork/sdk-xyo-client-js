import yargs from 'yargs'

import divine from '../divine'

describe('divine', () => {
  const parser = yargs().command(divine).help()
  it('requires arguments', async () => {
    const output = await new Promise((resolve) => {
      void parser.parse('divine', (err: unknown, argv: unknown, output: unknown) => {
        resolve(output)
      })
    })
    expect(output).toContain('Not enough non-option arguments')
  })
})
