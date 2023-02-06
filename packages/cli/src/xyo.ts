import yargs from 'yargs'
// eslint-disable-next-line import/no-internal-modules
import { hideBin } from 'yargs/helpers'

import { opts } from './command'

void yargs(hideBin(process.argv))
  .help()
  .alias('h', 'help')
  .boolean('verbose')
  .commandDir('./command/commands', opts)
  .version()
  .wrap(yargs.terminalWidth())
  .demandCommand(1)
  .parse()
