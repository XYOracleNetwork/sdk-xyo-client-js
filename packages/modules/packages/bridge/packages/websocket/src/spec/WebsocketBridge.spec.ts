import { asArchivistInstance } from '@xyo-network/archivist-model'
import type { ModuleDescriptionPayload } from '@xyo-network/module-model'
import { ModuleDescriptionSchema } from '@xyo-network/module-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { asAttachableNodeInstance } from '@xyo-network/node-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { Payload } from '@xyo-network/payload-model'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { WebsocketBridge } from '../Bridge.ts'
import { WebsocketClientBridge } from '../ClientBridge.ts'
import { WebsocketBridgeConfigSchema } from '../Config.ts'

/**
 * @group module
 * @group bridge
 */

describe.skip('WebsocketBridge', () => {
  const url = `${process.env.API_WEBSOCKET_DOMAIN}` ?? 'ws://localhost:8080'

  console.log(`WebsocketBridge:url ${url}`)

  it('WebsocketBridge: %s', async () => {
    const memClientNode = await MemoryNode.create({
      account: 'random',
      config: { name: 'TestClientNode', schema: 'network.xyo.node.config' },
    })
    const memHostNode = await MemoryNode.create({ account: 'random' })

    const host = await WebsocketBridge.create({
      account: 'random',
      config: { host: {}, name: 'TestHostBridge', schema: WebsocketBridgeConfigSchema, security: { allowAnonymous: true } },
    })

    await memHostNode.register(host)
    await memHostNode.attach(host?.address, true)

    const bridge = await WebsocketClientBridge.create({
      account: 'random',
      config: { client: { url }, name: 'TestClientBridge', schema: WebsocketBridgeConfigSchema, security: { allowAnonymous: true } },
    })

    await memClientNode.register(bridge)
    await memClientNode.attach(bridge?.address, true)
    const resolvedBridge = await memClientNode.resolve(bridge.id)
    expect(resolvedBridge).toBeDefined()

    const rootModule = await bridge?.resolve('TestClientNode')
    expect(rootModule).toBeDefined()

    const remoteNode = asAttachableNodeInstance(
      rootModule,
      () => `Failed to resolve correct object type [XYOPublic] [${rootModule?.constructor.name}]`,
    )

    const state = await remoteNode.state()
    const description = state.find<ModuleDescriptionPayload>(isPayloadOfSchemaType(ModuleDescriptionSchema))
    expect(description?.children).toBeArray()
    expect(description?.children?.length).toBeGreaterThan(0)
    expect(description?.queries).toBeArray()
    expect(description?.queries?.length).toBeGreaterThan(0)

    const archivistByName1 = await rootModule?.resolve('Archivist')
    expect(archivistByName1).toBeDefined()
    const archivistByName2 = await bridge.resolve('XYOPublic:Archivist')
    expect(archivistByName2).toBeDefined()
    const archivistInstance = asArchivistInstance(archivistByName2, 'Failed to cast archivist')
    expect(archivistInstance).toBeDefined()
    const knownPayload = PayloadWrapper.parse({ schema: 'network.xyo.test' })?.payload as Payload
    expect(knownPayload).toBeDefined()
    const knownHash = await PayloadBuilder.dataHash(knownPayload as Payload)
    const insertResult = await archivistInstance.insert([knownPayload])
    expect(insertResult).toBeDefined()
    const roundTripPayload = (await archivistInstance.get([knownHash]))[0]
    expect(roundTripPayload).toBeDefined()
  })
})
