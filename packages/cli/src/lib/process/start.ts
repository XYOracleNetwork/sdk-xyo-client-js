import { spawn } from 'child_process'
import { join } from 'path'

import { printLine } from '../print'
import { getErrFileDescriptor, getOutFileDescriptor } from './logs'
import { setPid } from './pid'

/**
 * The path to the script to run the Node
 */
const runNodeScriptPath = join(__dirname, '..', '..', '..', 'cjs', 'runNode.js')

/**
 * Runs the XYO Node process
 * @param bin The process to run
 * @param args The arguments to pass to the process
 * @returns The process ID of the Node
 */
export const start = async (daemonize = false, bin = 'node', args: ReadonlyArray<string> = [runNodeScriptPath]) => {
  printLine('Starting Node')
  // NOTE: Sync FD here because async warns about closing
  // when we background process as daemon
  const out = getOutFileDescriptor()
  const err = getErrFileDescriptor()
  // Create node via process
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
  printLine('Started Node')
}
