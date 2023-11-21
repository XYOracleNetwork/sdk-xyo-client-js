import { tmpdir } from 'os'
import { join } from 'path'

/**
 * The file to use to ensure singleton process
 */
export const pidFile = join(tmpdir(), 'xyo.pid')
