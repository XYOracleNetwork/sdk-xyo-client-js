import { spawn } from 'child_process'
import { openSync } from 'fs'

import { errFile, outFile } from './files'
import { setPid } from './pid'

/**
 * Runs the XYO Node process
 * @param bin The process to run
 * @param args The arguments to pass to the process
 * @returns The process ID of the Node
 */
export const start = async (bin = 'tail', args: ReadonlyArray<string> = ['-f', 'package.json'], daemonize = false): Promise<number | undefined> => {
  // TODO: Create if not exists but only open in append mode
  // TODO: Clear log files when appropriate (restarting?)
  // NOTE: Sync here because async warns about closing when we background
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
  await setPid(daemon.pid)
  return daemon.pid
}

// TODO: Start/Stop/Restart methods
// TODO: If already running do something smart
