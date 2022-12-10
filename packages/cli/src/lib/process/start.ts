import { XyoArchivistApi } from '@xyo-network/api'
import { HttpProxyModule } from '@xyo-network/http-proxy-module'
import { XyoModuleConfigSchema } from '@xyo-network/module'
import { MemoryNode } from '@xyo-network/node'
import { spawn } from 'child_process'
import { join } from 'path'

import { printError } from '../print'
import { getErrFileDescriptor, getOutFileDescriptor } from './logs'
import { setPid } from './pid'

/**
 * The path to the script to run the Node
 */
const runNodeScriptPath = join(__dirname, '..', '..', '..', 'cjs', 'runNode.js')

const config = { schema: XyoModuleConfigSchema }

/**
 * Runs the XYO Node process
 * @param bin The process to run
 * @param args The arguments to pass to the process
 * @returns The process ID of the Node
 */
export const start = async (daemonize = false, bin = 'node', args: ReadonlyArray<string> = [runNodeScriptPath]): Promise<MemoryNode> => {
  // NOTE: Sync FD here because async warns about closing
  // when we background process as daemon
  const out = getOutFileDescriptor()
  const err = getErrFileDescriptor()
  // TODO: Actually create node via process
  // NOTE: Simulate node creation/proxy via process
  // by creating a Node in memory for now
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
  // const node = await getNode()
  // TODO: AbstractNode instead of MemoryNode
  // TODO: Don't want to cast here
  const api = new XyoArchivistApi({ apiDomain: 'http://localhost:8080' })
  const address = (await api.get())?.address
  if (!address) {
    printError('Error retrieving address from Node')
    throw new Error('Error retrieving address from Node')
  }
  const node = (await HttpProxyModule.create({ address, api, config })) as unknown as MemoryNode
  return node
}
