import yargs from 'yargs'
// eslint-disable-next-line import/no-internal-modules
import { hideBin } from 'yargs/helpers'

void yargs(hideBin(process.argv))
  .command(
    'curl <url>',
    'fetch the contents of the URL',
    () => {
      // TODO:
    },
    (argv) => {
      console.info(argv)
    },
  )
  .demandCommand(1)
  .parse()
