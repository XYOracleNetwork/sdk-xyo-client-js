import yargs from 'yargs'
// eslint-disable-next-line import/no-internal-modules
import { hideBin } from 'yargs/helpers'

import { opts, OutputType } from './command'

void yargs(hideBin(process.argv))
  .commandDir('./command/commands', opts)
  .wrap(yargs.terminalWidth())
  .demandCommand(1)
  .help()
  .alias('h', 'help')
  .boolean('verbose')
  .option('output', {
    alias: 'o',
    choices: ['json', 'raw'] as OutputType[],
    default: 'json',
    demandOption: true,
    describe: 'Output format',
  })
  .version()
  .parse()
