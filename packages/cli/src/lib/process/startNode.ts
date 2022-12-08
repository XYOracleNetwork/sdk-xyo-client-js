import { spawn } from 'child_process'
import { openSync } from 'fs'

import { errFile, outFile } from './files'

/**
 * Runs the XYO Node process
 * @param bin The process to run
 * @param args The arguments to pass to the process
 * @returns The process ID of the Node
 */
export const startNode = (bin = 'tail', args: ReadonlyArray<string> = ['-f', 'package.json'], daemonize = false): number | undefined => {
  // TODO: Create if not exists but only open in append mode
  const out = openSync(outFile, 'a+')
  const err = openSync(errFile, 'a+')
  const daemon = spawn(bin, args, {
    detached: true,
    env: process.env,
    stdio: ['ignore', out, err],
  })
  if (daemonize) {
    daemon.unref()
  }
  return daemon.pid
}

// TODO: Start/Stop/Restart methods
// TODO: If already running do something smart
