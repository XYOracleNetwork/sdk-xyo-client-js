import yargs from 'yargs'

import account from '../account'

describe('account', () => {
  const parser = yargs().command(account).help()
  it('requires arguments', async () => {
    const output = await new Promise((resolve) => {
      void parser.parse('account', (err: unknown, argv: unknown, output: unknown) => {
        resolve(output)
      })
    })
    expect(output).toContain('Not enough non-option arguments')
  })
})
