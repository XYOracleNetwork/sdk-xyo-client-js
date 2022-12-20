import { homedir } from 'os'
import { join } from 'path'

const fileName = '.xyo.seed'

/**
 * The file path where the Account information is stored
 */
export const accountFile = join(homedir(), fileName)
