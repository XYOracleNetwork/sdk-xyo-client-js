import { Account } from '@xyo-network/account'
import { BridgeInstance } from '@xyo-network/bridge-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { NodeConfigSchema } from '@xyo-network/node-model'

import { HttpBridge } from '../HttpBridge'
import { HttpBridgeConfigSchema } from '../HttpBridgeConfig'

/**
 * @group module
 * @group bridge
 */

describe('HttpBridge', () => {
  const baseUrl = `${process.env.API_DOMAIN}` ?? 'http://localhost:8080'

  console.log(`HttpBridge:baseUrl ${baseUrl}`)
  it('Discover', async () => {
    const nodeUrl = `${baseUrl}/`
    const memNode = await MemoryNode.create({ account: Account.randomSync(), config: { name: 'MemoryNode', schema: NodeConfigSchema } })

    const bridge: BridgeInstance = await HttpBridge.create({
      account: Account.randomSync(),
      config: { discoverRoot: true, name: 'HttpBridge', nodeUrl, schema: HttpBridgeConfigSchema, security: { allowAnonymous: true } },
    })

    await memNode.register(bridge)
    await memNode.attach(bridge.address, true)

    /*const bridgeModules = await bridge.resolve('*')
    expect(bridgeModules).toBeArray()
    console.log(`moduleName: ${bridgeModules[0].config.name}`)
    expect(bridgeModules.length).toBeGreaterThan(20)
    */

    const modules = await memNode.resolve('*')
    expect(modules).toBeArray()
    expect(modules.length).toBeGreaterThan(20)
  })
})
