/* eslint-disable max-statements */

import { Account } from '@xyo-network/account'
import { asArchivistInstance, asAttachableArchivistInstance } from '@xyo-network/archivist-model'
import { isModule, isModuleInstance, isModuleObject, ModuleDescriptionPayload, ModuleDescriptionSchema } from '@xyo-network/module-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { asAttachableNodeInstance, isNodeInstance } from '@xyo-network/node-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { HttpBridgeConfigSchema } from '../HttpBridgeConfig'
import { HttpBridge } from '../HttpBridgeFull'

/**
 * @group module
 * @group bridge
 */

describe('HttpBridge', () => {
  const baseUrl = `${process.env.API_DOMAIN}` ?? 'http://localhost:8080'

  console.log(`HttpBridge:baseUrl ${baseUrl}`)
  const cases = [
    ['/', `${baseUrl}`],
    /*['/node', `${baseUrl}/node`],*/
  ]

  it.each(cases)('HttpBridge: %s', async (_, nodeUrl) => {
    const memNode = await MemoryNode.create({ account: Account.randomSync() })
    const extraMemNode = await MemoryNode.create({ account: Account.randomSync() })

    const bridge = await HttpBridge.create({
      account: Account.randomSync(),
      config: { discoverRoots: 'start', name: 'TestBridge', nodeUrl, schema: HttpBridgeConfigSchema, security: { allowAnonymous: true } },
    })

    await bridge?.start?.()
    await memNode.register(bridge)
    await memNode.attach(bridge?.address, true)

    const resolvedBridge = await memNode.resolve(bridge.id)
    expect(resolvedBridge).toBeDefined()

    const rootModule = await bridge?.resolve('XYOPublic')
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
    const publicXyo = await bridge.resolve('XYOPublic')
    expect(publicXyo).toBeDefined()
    const publicXyoSelfResolve = publicXyo?.resolve('XYOPublic')
    expect(publicXyoSelfResolve).toBeDefined()
    if (publicXyo) {
      const attachablePublicXyo = asAttachableArchivistInstance(archivistByName2, 'Failed to cast publicXyo')
      expect(attachablePublicXyo).toBeDefined()
      await extraMemNode.register(attachablePublicXyo)
      await extraMemNode.attach(attachablePublicXyo.address, true)
      const publicXyoNodeResolveAddress = extraMemNode?.resolve(attachablePublicXyo.address)
      expect(publicXyoNodeResolveAddress).toBeDefined()
      const publicXyoNodeResolve = extraMemNode?.resolve('Archivist')
      expect(publicXyoNodeResolve).toBeDefined()
    }
    const archivistByName3 = await publicXyo?.resolve('Archivist')
    expect(archivistByName3).toBeDefined()
    expect(archivistByName3).toEqual(archivistByName1)
    expect(archivistByName3).toEqual(archivistByName2)
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
  it.each(cases)('HttpBridge - Nested: %s', async (_, nodeUrl) => {
    const memNode1 = await MemoryNode.create({ account: Account.randomSync(), config: { schema: 'network.xyo.node.config' } })
    const memNode2 = await MemoryNode.create({ account: Account.randomSync(), config: { schema: 'network.xyo.node.config' } })
    const memNode3 = await MemoryNode.create({ account: Account.randomSync(), config: { schema: 'network.xyo.node.config' } })

    await memNode1.register(memNode2)
    await memNode1.attach(memNode2.address, true)
    await memNode2.register(memNode3)
    await memNode2.attach(memNode3.address, true)

    const bridge = await HttpBridge.create({
      account: Account.randomSync(),
      config: { nodeUrl, schema: HttpBridgeConfigSchema, security: { allowAnonymous: true } },
    })

    await bridge.getRoots()
    const module = await bridge.resolve('XYOPublic')

    expect(module).toBeDefined()
    expect(isModule(module)).toBeTrue()
    expect(isModuleObject(module)).toBeTrue()

    const remoteNode = asAttachableNodeInstance(
      module,
      `Failed to resolve [XYOPublic] - ${module?.address} [${module?.id}] [${module?.constructor.name}]`,
    )

    expect(isNodeInstance(remoteNode)).toBeTrue()
    expect(isModuleInstance(remoteNode)).toBeTrue()

    await memNode3.register(remoteNode)
    await memNode3.attach(remoteNode?.address, true)
    const description = (await remoteNode.state()).find<ModuleDescriptionPayload>(isPayloadOfSchemaType(ModuleDescriptionSchema))
    expect(description?.children).toBeArray()
    expect(description?.children?.length).toBeGreaterThan(0)
    expect(description?.queries).toBeArray()
    expect(description?.queries?.length).toBeGreaterThan(0)

    // Works if you supply the known address for 'Archivist'
    //const [archivistByAddress] = await memNode.resolve({ address: ['461fd6970770e97d9f66c71658f4b96212581f0b'] })
    //expect(archivistByAddress).toBeDefined()

    /*const mods = await bridge.resolve('*')
    for (const mod of mods) {
      console.log(`module [${mod.address}]: ${mod.modName}`)
    }*/

    const node = await bridge.resolve('XYOPublic')
    expect(node).toBeDefined()

    const archivistByName1 = await node?.resolve('Archivist')
    expect(archivistByName1).toBeDefined()

    const [archivistByName2] = (await node?.resolve({ name: ['Archivist'] })) ?? []
    expect(archivistByName2).toBeDefined()
    const [payloadStatsDivinerByName] = (await node?.resolve({ name: ['PayloadStatsDiviner'] })) ?? []
    expect(payloadStatsDivinerByName).toBeDefined()
    const [boundwitnessStatsDivinerByName] = (await node?.resolve({ name: ['BoundWitnessStatsDiviner'] })) ?? []
    expect(boundwitnessStatsDivinerByName).toBeDefined()
  })
})
