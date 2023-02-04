import yargs from 'yargs'
// eslint-disable-next-line import/no-internal-modules
import { hideBin } from 'yargs/helpers'

// import * as pack from '../package.json'

void yargs(hideBin(process.argv))
  .help()
  .commandDir('./command', {
    exclude: new RegExp('.spec.ts'),
    extensions: ['js', 'ts'],
  })
  // .version(pack.version)
  .demandCommand(1)
  .parse()
