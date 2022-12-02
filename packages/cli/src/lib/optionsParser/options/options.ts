import { Options } from 'yargs'

import { mod } from './mod'
import { verbose } from './verbose'

export const options: [string, Options][] = [mod, verbose]
