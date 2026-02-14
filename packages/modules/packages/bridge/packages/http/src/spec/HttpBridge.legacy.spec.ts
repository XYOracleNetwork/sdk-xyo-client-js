import '@xylabs/vitest-extended'

import { MemoryNode } from '@xyo-network/node-memory'
import type { NodeInstance } from '@xyo-network/node-model'
import { NodeConfigSchema } from '@xyo-network/node-model'
import {
  describe, expect, it,
} from 'vitest'

import { HttpBridge } from '../HttpBridge.ts'
import { HttpBridgeConfigSchema } from '../HttpBridgeConfig.ts'

/**
 * @group module
 * @group bridge
 */

describe('HttpBridge', () => {
  const baseUrl = `${process.env.API_DOMAIN ?? 'http://localhost:8080'}`

  console.log(`HttpBridge:baseUrl ${baseUrl}`)
  it('Discover', async () => {
    const nodeUrl = `${baseUrl}/`
    const memNode = await MemoryNode.create({ account: 'random', config: { name: 'MemoryNode', schema: NodeConfigSchema } })

    const bridge = await HttpBridge.create({
      account: 'random',
      config: {
        name: 'HttpBridge', client: { url: nodeUrl, discoverRoots: 'start' }, schema: HttpBridgeConfigSchema, security: { allowAnonymous: true },
      },
    })

    await memNode.register(bridge)
    await memNode.attach(bridge.address, true)

    const publicNode = await bridge.resolve<NodeInstance>('XYOPublic')
    expect(publicNode).toBeDefined()

    if (publicNode) {
      console.log(`publicNode[${publicNode.address}]: ${publicNode.modName}`)
      const publicNodeModules = await publicNode.resolve('*', { direction: 'down' })
      expect(publicNodeModules).toBeArray()
      expect(publicNodeModules.length).toBeGreaterThan(0)
    }

    const bridgeModules = await bridge.resolve('*', { direction: 'down' })
    expect(bridgeModules).toBeArray()
    expect(bridgeModules.length).toBeGreaterThan(0)

    /*
    const modules = await memNode.resolve('*')
    expect(modules).toBeArray()
    expect(modules.length).toBeGreaterThan(20)
    */
  })
})
