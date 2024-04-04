import { Account } from '@xyo-network/account'
import {
  AsyncQueryBusIntersectConfig,
  PubSubBridge,
  PubSubBridgeConfig,
  PubSubBridgeConfigSchema,
  PubSubBridgeParams,
} from '@xyo-network/bridge-pub-sub'
import { HttpBridge, HttpBridgeConfigSchema } from '@xyo-network/http-bridge'
import { MemoryNode } from '@xyo-network/node-memory'
import { NodeConfigSchema } from '@xyo-network/node-model'

/**
 * @group module
 * @group bridge
 */

describe('HttpBridge with PubSubBridge', () => {
  const httpBaseUrl = process.env.XNS_API_DOMAIN ?? 'https://beta.xns.xyo.network' ?? 'http://localhost:80'

  console.log(`HttpBridge:baseUrl ${httpBaseUrl}`)
  const cases = [
    ['/', `${httpBaseUrl}`],
    /*['/node', `${baseUrl}/node`],*/
  ]

  it.each(cases)('HttpBridge: %s', async (_, nodeUrl) => {
    const memNode = await MemoryNode.create({ account: Account.randomSync(), config: { name: 'MemNodeArie', schema: NodeConfigSchema } })
    const intersect: AsyncQueryBusIntersectConfig = {
      queries: { archivist: 'XNS:Intersect:QueryArchivist', boundWitnessDiviner: 'XNS:Intersect:QueryBoundWitnessDiviner' },
      responses: { archivist: 'XNS:Intersect:ResponseArchivist', boundWitnessDiviner: 'XNS:Intersect:ResponseBoundWitnessDiviner' },
    }

    const bridge = await HttpBridge.create({
      account: Account.randomSync(),
      config: { name: 'TestBridge', nodeUrl, schema: HttpBridgeConfigSchema, security: { allowAnonymous: true } },
    })

    await bridge?.start?.()
    await memNode.register(bridge)
    await memNode.attach(bridge?.address, true)

    const config: PubSubBridgeConfig = { client: { intersect }, host: { intersect }, name: 'PubSubBridgeArie', schema: PubSubBridgeConfigSchema }
    const psParams: PubSubBridgeParams = { account: Account.randomSync(), config }
    const psBridge = await PubSubBridge.create(psParams)
    await memNode.register(psBridge)
    await memNode.attach(psBridge?.address, true)

    await psBridge.start()
    console.log(`Exposing: ${memNode.address}`)
    await psBridge.expose(memNode.address)

    /*
    const subNodeInstance = await memNode?.resolve('SubNode')
    expect(subNodeInstance).toBeDefined()

    const testBridgeInstance = await memNode?.resolve('SubNode:TestBridge')
    expect(testBridgeInstance).toBeDefined()

    const xns1 = await testBridgeInstance?.resolve('XNS')
    expect(xns1).toBeDefined()

    const xns = await memNode?.resolve('SubNode:TestBridge:XNS')
    expect(xns).toBeDefined()

    const intersect = await memNode?.resolve('SubNode:TestBridge:XNS:Intersect')
    expect(intersect).toBeDefined()
    */

    const queryArchivist = await memNode?.resolve('XNS:Intersect:QueryArchivist')
    expect(queryArchivist?.id).toBe('QueryArchivist')

    await psBridge.unexpose(memNode.address)
  })
})
