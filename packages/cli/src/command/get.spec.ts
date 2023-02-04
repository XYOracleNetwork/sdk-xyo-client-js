import yargs from 'yargs'

import get from './get'

it('returns help output', async () => {
  // Initialize parser using the command module
  const parser = yargs.command(get).help()

  // Run the command module with --help as argument
  const output = await new Promise((resolve) => {
    parser.parse('--help', (err: unknown, argv: unknown, output: unknown) => {
      resolve(output)
    })
  })

  // Verify the output is correct
  expect(output).toBe(expect.stringContaining('helpful message'))
})
