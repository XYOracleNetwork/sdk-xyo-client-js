import { MemoryNode } from '@xyo-network/node'
import { getNode } from '@xyo-network/node-app'
import { spawn } from 'child_process'
import { join } from 'path'

import { getErrFileDescriptor, getOutFileDescriptor } from './logs'
import { setPid } from './pid'

/**
 * The path to the script to run the Node
 */
const runNodeScriptPath = join(__dirname, '..', '..', '..', 'runNode.js')

/**
 * Runs the XYO Node process
 * @param bin The process to run
 * @param args The arguments to pass to the process
 * @returns The process ID of the Node
 */
export const start = async (bin = 'node', args: ReadonlyArray<string> = [runNodeScriptPath], daemonize = false): Promise<MemoryNode> => {
  // NOTE: Sync FD here because async warns about closing
  // when we background process as daemon
  const out = getOutFileDescriptor()
  const err = getErrFileDescriptor()
  // TODO: Actually create node via process
  // NOTE: Simulate node creation/proxy via process
  // by creating a Node in memory for now
  const node = await getNode()
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
  return node
}
