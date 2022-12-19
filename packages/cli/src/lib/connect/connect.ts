import { delay } from '@xylabs/delay'
import { HttpProxyModule } from '@xyo-network/http-proxy-module'
import { AbstractModuleConfigSchema } from '@xyo-network/module'
import { MemoryNode } from '@xyo-network/node'

import { printError, printLine } from '../print'

const config = { schema: AbstractModuleConfigSchema }

const nodeConnectionErrorMsg = 'Error connecting to Node'

export const connect = async (attempts = 10, interval = 500) => {
  // TODO: Configurable via config or dynamically determined
  const apiDomain = process.env.API_DOMAIN || 'http://localhost:8080'
  const apiConfig = { apiDomain }
  printLine(`Connecting to Node at: ${apiDomain}`)
  let count = 0
  do {
    try {
      const node = await HttpProxyModule.create({ apiConfig, config })
      printLine(`Connected to Node at: ${apiDomain}`)
      printLine(`Node Address: 0x${node.address}`)
      return node as unknown as MemoryNode
    } catch (err) {
      count++
      await delay(interval)
      continue
    }
  } while (count < attempts)
  printError(nodeConnectionErrorMsg)
  throw new Error(nodeConnectionErrorMsg)
}
