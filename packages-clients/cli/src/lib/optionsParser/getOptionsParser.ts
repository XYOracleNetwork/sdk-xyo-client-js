import yargs from 'yargs'
// eslint-disable-next-line import/no-internal-modules
import { hideBin } from 'yargs/helpers'

import { options } from './options'

export const getOptionsParser = () => {
  const optionsParser = yargs(hideBin(process.argv))
  options.forEach((option) => optionsParser.option(...option))
  return optionsParser
}
