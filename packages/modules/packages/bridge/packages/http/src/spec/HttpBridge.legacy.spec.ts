import { Account } from '@xyo-network/account'
import { MemoryNode } from '@xyo-network/node-memory'
import { NodeConfigSchema, NodeInstance } from '@xyo-network/node-model'

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

    const bridge = await HttpBridge.create({
      account: Account.randomSync(),
      config: { discoverRoots: 'start', name: 'HttpBridge', nodeUrl, schema: HttpBridgeConfigSchema, security: { allowAnonymous: true } },
    })

    await memNode.register(bridge)
    await memNode.attach(bridge.address, true)

    const publicNode = await bridge.resolve<NodeInstance>('XYOPublic')
    expect(publicNode).toBeDefined()

    if (publicNode) {
      console.log(`publicNode[${publicNode.address}]: ${publicNode.modName}`)
      const publicNodeModules = await publicNode.resolve('*', { direction: 'down' })
      expect(publicNodeModules).toBeArray()
      expect(publicNodeModules.length).toBeGreaterThan(20)
    }

    const bridgeModules = await bridge.resolve('*', { direction: 'down' })
    expect(bridgeModules).toBeArray()
    expect(bridgeModules.length).toBeGreaterThan(20)

    /*
    const modules = await memNode.resolve('*')
    expect(modules).toBeArray()
    expect(modules.length).toBeGreaterThan(20)
    */
  })
})
