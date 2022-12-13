import { XyoArchivistApi } from '@xyo-network/api'
import { HttpProxyModule } from '@xyo-network/http-proxy-module'
import { XyoModuleConfigSchema } from '@xyo-network/module'
import { MemoryNode } from '@xyo-network/node'
import { spawn } from 'child_process'
import { join } from 'path'

import { printError, printLine } from '../print'
import { getErrFileDescriptor, getOutFileDescriptor } from './logs'
import { setPid } from './pid'

/**
 * The path to the script to run the Node
 */
const runNodeScriptPath = join(__dirname, '..', '..', '..', 'cjs', 'runNode.js')

const config = { schema: XyoModuleConfigSchema }

const nodeAddressErrorMsg = 'Error retrieving address from Node'

/**
 * Runs the XYO Node process
 * @param bin The process to run
 * @param args The arguments to pass to the process
 * @returns The process ID of the Node
 */
export const start = async (daemonize = false, bin = 'node', args: ReadonlyArray<string> = [runNodeScriptPath]): Promise<MemoryNode> => {
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
  const apiDomain = process.env.API_DOMAIN || 'http://localhost:8080'
  printLine(`Connecting to Node at: ${apiDomain}`)
  const api = new XyoArchivistApi({ apiDomain })
  const address = (await api.get())?.address
  if (!address) {
    printError(nodeAddressErrorMsg)
    throw new Error(nodeAddressErrorMsg)
  }
  const node = (await HttpProxyModule.create({ address, api, config })) as unknown as MemoryNode
  printLine(`Connected to Node with Address: ${address}`)
  return node
}
