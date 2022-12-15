import { delay } from '@xylabs/delay'
import { XyoArchivistApi } from '@xyo-network/api'
import { HttpProxyModule } from '@xyo-network/http-proxy-module'
import { XyoModuleConfigSchema } from '@xyo-network/module'
import { MemoryNode } from '@xyo-network/node'

import { printError, printLine } from '../print'

const config = { schema: XyoModuleConfigSchema }

const nodeAddressErrorMsg = 'Error retrieving address from Node'
const nodeConnectionErrorMsg = 'Error connecting to Node'

export const connect = async (attempts = 5, interval = 500) => {
  // TODO: Configurable via config or dynamically determined
  const apiDomain = process.env.API_DOMAIN || 'http://localhost:8080'
  printLine(`Connecting to Node at: ${apiDomain}`)
  let count = 0
  do {
    try {
      const api = new XyoArchivistApi({ apiDomain })
      const address = (await api.get())?.address
      if (!address) {
        printError(nodeAddressErrorMsg)
        throw new Error(nodeAddressErrorMsg)
      }
      const node = await HttpProxyModule.create({ address, api, config })
      printLine(`Connected to Node at: ${apiDomain}`)
      printLine(`Node Address: 0x${address}`)
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
