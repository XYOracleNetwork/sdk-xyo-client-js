import '@xylabs/vitest-extended'

import { HttpBridge, HttpBridgeConfigSchema } from '@xyo-network/bridge-http'
import {
  AsyncQueryBusIntersectConfig,
  PubSubBridge,
  PubSubBridgeConfig,
  PubSubBridgeConfigSchema,
  PubSubBridgeParams,
} from '@xyo-network/bridge-pub-sub'
import { MemoryNode } from '@xyo-network/node-memory'
import { NodeConfigSchema } from '@xyo-network/node-model'
import {
  describe, expect, it,
} from 'vitest'

/**
 * @group module
 * @group bridge
 */

describe.skip('HttpBridge with PubSubBridge', () => {
  const httpBaseUrl = process.env.XNS_API_DOMAIN ?? 'https://beta.xns.xyo.network' ?? 'http://localhost:80'

  console.log(`HttpBridge:baseUrl ${httpBaseUrl}`)
  const cases = [
    ['/', `${httpBaseUrl}`],
    /* ['/node', `${baseUrl}/node`], */
  ]

  it.each(cases)('HttpBridge: %s', async (_, nodeUrl) => {
    const memNode = await MemoryNode.create({ account: 'random', config: { name: 'MemNodeArie', schema: NodeConfigSchema } })
    const intersect: AsyncQueryBusIntersectConfig = {
      queries: { archivist: 'MemNodeArie:XNS:Intersect:QueryArchivist', boundWitnessDiviner: 'MemNodeArie:XNS:Intersect:QueryBoundWitnessDiviner' },
      responses: {
        archivist: 'MemNodeArie:XNS:Intersect:ResponseArchivist',
        boundWitnessDiviner: 'MemNodeArie:XNS:Intersect:ResponseBoundWitnessDiviner',
      },
    }

    const bridge = await HttpBridge.create({
      account: 'random',
      config: {
        discoverRoots: 'start', name: 'TestBridge', nodeUrl, schema: HttpBridgeConfigSchema, security: { allowAnonymous: true },
      },
    })

    await bridge?.start?.()
    await memNode.register(bridge)
    await memNode.attach(bridge?.address, true)

    const config: PubSubBridgeConfig = {
      client: { intersect }, host: { intersect }, name: 'PubSubBridgeArie', schema: PubSubBridgeConfigSchema,
    }
    const psParams: PubSubBridgeParams = { account: 'random', config }
    const psBridge = await PubSubBridge.create(psParams)
    await memNode.register(psBridge)
    await memNode.attach(psBridge?.address, true)

    await psBridge.start()
    console.log(`Exposing: ${memNode.address}`)
    await bridge.expose(memNode.address)

    const subNodeInstance = await memNode?.resolve('PubSubBridgeArie')
    expect(subNodeInstance).toBeDefined()

    const testBridgeInstance = await memNode?.resolve('PubSubBridgeArie:TestBridge')
    expect(testBridgeInstance).toBeDefined()

    const xns1 = await testBridgeInstance?.resolve('XNS')
    expect(xns1).toBeDefined()

    const xns = await memNode?.resolve('PubSubBridgeArie:TestBridge:XNS')
    expect(xns).toBeDefined()

    const intersectNode = await memNode?.resolve('PubSubBridgeArie:TestBridge:XNS:Intersect')
    expect(intersectNode).toBeDefined()

    const queryArchivist = await memNode?.resolve('XNS:Intersect:QueryArchivist')
    expect(queryArchivist?.id).toBe('QueryArchivist')

    await psBridge.unexpose(memNode.address)
  })
})
