import yargs from 'yargs'
// eslint-disable-next-line import/no-internal-modules
import { hideBin } from 'yargs/helpers'

void yargs(hideBin(process.argv))
  .commandDir('./command', {
    extensions: process.env.NODE_ENV === 'development' ? ['js', 'ts'] : ['js'],
  })
  .demandCommand(1)
  .parse()
