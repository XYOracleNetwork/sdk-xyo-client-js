import { Options } from 'yargs'

import { daemon } from './daemon'
import { mod } from './mod'
import { verbose } from './verbose'

export const options: [string, Options][] = [daemon, mod, verbose]
