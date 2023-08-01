import { config } from 'dotenv'
import yargs from 'yargs'
// eslint-disable-next-line import/no-internal-modules
import { hideBin } from 'yargs/helpers'

import { opts, OutputType } from './command'

config()

void yargs(hideBin(process.argv))
  .commandDir('./command/commands', opts)
  .wrap(yargs.terminalWidth())
  .demandCommand(1)
  .help()
  .alias('h', 'help')
  .boolean('verbose')
  .options({
    // TODO: Config file
    config: {
      config: true,
    },
    network: {
      choices: ['local', 'kerplunk', 'main'],
      default: 'kerplunk',
      demandOption: false,
      describe: 'Known network to target.',
      type: 'string',
    },
  })
  .option('output', {
    alias: 'o',
    choices: ['json', 'raw'] as OutputType[],
    default: 'json',
    demandOption: true,
    describe: 'Output format',
  })
  .version()
  .parse()
