import { spawn } from 'child_process'

import { getErrFileDescriptor, getOutFileDescriptor } from './logs'
import { setPid } from './pid'

/**
 * Runs the XYO Node process
 * @param bin The process to run
 * @param args The arguments to pass to the process
 * @returns The process ID of the Node
 */
export const start = async (bin = 'tail', args: ReadonlyArray<string> = ['-f', 'package.json'], daemonize = false): Promise<number | undefined> => {
  // NOTE: Sync FD here because async warns about closing
  // when we background process as daemon
  const out = getOutFileDescriptor()
  const err = getErrFileDescriptor()
  const daemon = spawn(bin, args, {
    detached: true,
    env: process.env,
    stdio: ['ignore', out, err],
  })
  if (daemonize) {
    daemon.unref()
  }
  const { pid } = daemon
  await setPid(pid)
  return pid
}
