import { NodeModule } from '@xyo-network/node'

import { MessageQueryData, MessageResultData } from './MessageBridge'

export class BrowserNodeServiceWorker {
  constructor(node: NodeModule) {
    self.addEventListener('activate', (event: Event) => {
      console.log(`Activate: ${JSON.stringify(event.type)}`)
    })

    self.addEventListener('install', (event) => {
      console.log(`Install: ${JSON.stringify(event.type)}`)
    })

    self.addEventListener('message', async (event) => {
      console.log(`Message: ${JSON.stringify(event.type)}`)
      const { address, port, msgId, query, payloads } = event.data as MessageQueryData
      const module = address ? await node.downResolver.resolveOne(address) : node
      if (module) {
        const result: MessageResultData = { address, msgId, result: await module.query(query, payloads) }
        port.postMessage({ result })
      }
    })
  }
}
