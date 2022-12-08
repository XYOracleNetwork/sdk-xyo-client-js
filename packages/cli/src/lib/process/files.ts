import { tmpdir } from 'os'
import { join } from 'path'

/**
 * File used for process stdout
 */
export const outFile = join(tmpdir(), 'xyo.stdout.txt')

/**
 * File used for process stderr
 */
export const errFile = join(tmpdir(), 'xyo.stderr.txt')

// TODO: Write pid to file as singleton to ensure only running
// one copy of node
/**
 * The file to use to ensure singleton process
 */
export const pidFile = join(tmpdir(), 'xyo.pid')
