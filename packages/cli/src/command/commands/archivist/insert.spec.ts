import yargs from 'yargs'
// eslint-disable-next-line import/no-internal-modules
import { hideBin } from 'yargs/helpers'

import insert from './insert'

it.skip('returns help output', async () => {
  // Initialize parser using the command module
  const parser = yargs(hideBin(process.argv)).command(insert).help()

  // Run the command module with --help as argument
  const output = await new Promise((resolve) => {
    void parser.parse('--help', (err: unknown, argv: unknown, output: unknown) => {
      resolve(output)
    })
  })

  // Verify the output is correct
  expect(output).toBe(expect.stringContaining('helpful message'))
})
