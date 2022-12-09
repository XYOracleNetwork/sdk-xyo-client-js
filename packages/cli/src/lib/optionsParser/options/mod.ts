import { Options } from 'yargs'

export const mod: [string, Options] = [
  'module',
  {
    alias: 'm',
    description: 'Modules to load',
    type: 'string',
  },
]
