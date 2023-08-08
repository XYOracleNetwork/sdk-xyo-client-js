import { HDWallet } from '@xyo-network/account'
import { BridgeInstance } from '@xyo-network/bridge-model'
import { MemoryNode } from '@xyo-network/node-memory'

import { HttpBridge } from '../HttpBridge'
import { HttpBridgeConfigSchema } from '../HttpBridgeConfig'

describe('HttpBridge', () => {
  const baseUrl = 'https://sfjhskjdsfhdsk.com'

  console.log(`HttpBridge:baseUrl ${baseUrl}`)
  const cases = [
    ['/', `${baseUrl}`],
    /*['/node', `${baseUrl}/node`],*/
  ]

  it.each(cases)('HttpBridge: %s', async (_, nodeUrl) => {
    const memNode = await MemoryNode.create({ account: await HDWallet.random() })

    const bridge: BridgeInstance = await HttpBridge.create({
      account: await HDWallet.random(),
      config: { nodeUrl, schema: HttpBridgeConfigSchema, security: { allowAnonymous: true } },
    })

    await bridge?.start?.()

    expect(bridge?.connected).toBe(false)

    await memNode.register(bridge)
    await memNode.attach(bridge.address, true)

    const modules = await memNode.resolve()
    expect(modules.length).toBe(2)
  })
})
