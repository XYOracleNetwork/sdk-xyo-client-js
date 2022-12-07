import { spawn } from 'child_process'
import { openSync } from 'fs'

// TODO: Separate files?
// TODO: Create if not exists but only open in append mode
export const logFile = '/tmp/xyo.log'

// TODO: Write pid to file as singleton to ensure only running
// one copy of node
/**
 * The file to use to ensure singleton process
 */
export const pidFile = '/tmp/xyo.pid'

export const daemonizeNode = (): number | undefined => {
  const out = openSync(logFile, 'a+')
  const err = openSync(logFile, 'a+')
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
