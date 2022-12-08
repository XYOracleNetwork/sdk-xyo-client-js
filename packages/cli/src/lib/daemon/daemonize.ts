import { spawn } from 'child_process'
import { openSync } from 'fs'
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

export const daemonizeNode = (): number | undefined => {
  // TODO: Create if not exists but only open in append mode
  const out = openSync(outFile, 'a+')
  const err = openSync(errFile, 'a+')
  const bin = 'tail'
  const args: ReadonlyArray<string> = ['-f', 'package.json']
  const daemon = spawn(bin, args, {
    detached: true,
    env: process.env,
    stdio: ['ignore', out, err],
  })
  daemon.unref()
  return daemon.pid
}

// TODO: Restart process
// TODO: If already running do something smart
