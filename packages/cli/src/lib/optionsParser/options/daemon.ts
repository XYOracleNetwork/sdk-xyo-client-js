import { Options } from 'yargs'

export const daemon: [string, Options] = [
  'daemon',
  {
    alias: 'd',
    description: 'Run as daemon',
    type: 'string',
  },
]
