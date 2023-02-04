import yargs from 'yargs'
// eslint-disable-next-line import/no-internal-modules
import { hideBin } from 'yargs/helpers'

// import * as pack from '../package.json'

void yargs(hideBin(process.argv))
  .help()
  .commandDir('./command', {
    extensions: process.env.NODE_ENV === 'development' ? ['js', 'ts'] : ['js'],
  })
  // .version(pack.version)
  .demandCommand(1)
  .parse()
