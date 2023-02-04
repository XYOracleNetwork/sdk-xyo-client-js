import yargs from 'yargs'
// eslint-disable-next-line import/no-internal-modules
import { hideBin } from 'yargs/helpers'

import { opts } from './command'
// import * as pack from '../package.json'

void yargs(hideBin(process.argv))
  .help()
  .commandDir('./command/commands', opts)
  // .version(pack.version)
  .demandCommand(1)
  .parse()
