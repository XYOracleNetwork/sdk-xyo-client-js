import { extname } from 'path'
import yargs from 'yargs'
// eslint-disable-next-line import/no-internal-modules
import { hideBin } from 'yargs/helpers'
// import * as pack from '../package.json'

/**
 * The extension of this file. Used to detect if running
 * via TS or transpiled output.
 */
const thisFileExtension = extname(__filename).replace('.', '')

/**
 * Used with array.filter to remove duplicate array elements
 * @param value The current value
 * @param index The index of the current value
 * @param array The array
 * @returns
 */
const unique = (value: string, index: number, array: string[]) => array.indexOf(value) === index

void yargs(hideBin(process.argv))
  .help()
  .commandDir('./commands', {
    exclude: new RegExp('.spec.ts'),
    extensions: [thisFileExtension, 'js'].filter(unique),
  })
  // .version(pack.version)
  .demandCommand(1)
  .parse()
