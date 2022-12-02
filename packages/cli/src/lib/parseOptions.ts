import yargs from 'yargs'
// eslint-disable-next-line import/no-internal-modules
import { hideBin } from 'yargs/helpers'

import { options } from './options'

export const parseOptions = () => {
  const opt = yargs(hideBin(process.argv))
  options.forEach((option) => opt.option(...option))
  return opt
}
