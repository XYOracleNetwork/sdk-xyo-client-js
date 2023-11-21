import { homedir } from 'os'
import { join } from 'path'

const fileName = '.xyo'

/**
 * The file path where the settings information is stored
 */
export const settingsFile = join(homedir(), fileName)
