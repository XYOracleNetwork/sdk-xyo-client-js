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
  .options({
    // TODO: Config file
    config: {
      config: true,
    },
    // TODO: Network selection
    network: {
      choices: ['local', 'kerplunk', 'main'],
      default: 'kerplunk',
      demandOption: true,
      describe: 'Known network to target (custom networks/ports supported via config)',
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
