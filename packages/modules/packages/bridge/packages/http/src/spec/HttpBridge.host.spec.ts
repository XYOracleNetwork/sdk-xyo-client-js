import { ModuleDescriptionPayload, ModuleDescriptionSchema } from '@xyo-network/module-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { asAttachableNodeInstance } from '@xyo-network/node-model'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'

import { HttpBridgeConfigSchema } from '../HttpBridgeConfig'
import { HttpBridge } from '../HttpBridgeFull'

/**
 * @group module
 * @group bridge
 */

describe.skip('HttpBridge', () => {
  const port = 3011
  const url = `http://localhost:${port}`

  console.log(`HttpBridge:baseUrl ${url}`)
  const cases: [string, string, number][] = [
    ['/', `${url}`, port],
    /*['/node', `${baseUrl}/node`],*/
  ]

  it.each(cases)('HttpBridge: %s', async (_, url, port) => {
    const hostNode = await MemoryNode.create({ account: 'random' })
    const clientNode = await MemoryNode.create({ account: 'random' })
    const hostedNode = await MemoryNode.create({ account: 'random' })

    await hostNode.register(hostedNode)
    await hostNode.attach(hostedNode.address, true)

    const clientBridge = await HttpBridge.create({
      account: 'random',
      config: {
        client: { discoverRoots: 'start', url },
        name: 'TestBridgeClient',
        schema: HttpBridgeConfigSchema,
        security: { allowAnonymous: true },
      },
    })

    const hostBridge = await HttpBridge.create({
      account: 'random',
      config: {
        host: {
          port,
        },
        name: 'TestBridgeHost',
        schema: HttpBridgeConfigSchema,
        security: { allowAnonymous: true },
      },
    })

    await hostNode.register(hostBridge)
    await hostNode.attach(hostBridge?.address, true)

    await clientNode.register(clientBridge)
    await clientNode.attach(clientBridge?.address, true)

    const resolvedHostBridge = await hostNode.resolve(hostBridge.id)
    expect(resolvedHostBridge).toBeDefined()

    await hostBridge.expose(hostedNode.address)

    const bridgedHostedModule = await hostBridge?.resolve(hostedNode.address)
    expect(bridgedHostedModule).toBeDefined()

    const bridgedHostedNode = asAttachableNodeInstance(
      bridgedHostedModule,
      () => `Failed to resolve correct object type [${bridgedHostedModule?.constructor.name}]`,
    )

    if (bridgedHostedNode) {
      const state = await bridgedHostedNode.state()
      const description = state.find<ModuleDescriptionPayload>(isPayloadOfSchemaType(ModuleDescriptionSchema))
      expect(description?.children).toBeArray()
      expect(description?.queries).toBeArray()
      expect(description?.queries?.length).toBeGreaterThan(0)
    }
  })
})
