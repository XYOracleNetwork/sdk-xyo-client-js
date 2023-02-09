import yargs from 'yargs'

import find from '../find'

describe('find', () => {
  const parser = yargs().command(find).help()
  it('requires arguments', async () => {
    const output = await new Promise((resolve) => {
      void parser.parse('find', (err: unknown, argv: unknown, output: unknown) => {
        resolve(output)
      })
    })
    expect(output).toContain('Not enough non-option arguments')
  })
})
