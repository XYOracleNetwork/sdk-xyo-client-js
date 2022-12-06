import { Options } from 'yargs'

export const verbose: [string, Options] = [
  'verbose',
  {
    alias: 'v',
    default: false,
    description: 'Run with verbose logging',
    type: 'boolean',
  },
]
