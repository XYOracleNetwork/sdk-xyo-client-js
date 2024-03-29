/* eslint-disable max-statements */

import { Account } from '@xyo-network/account'
import { asArchivistInstance } from '@xyo-network/archivist-model'
import { BridgeInstance } from '@xyo-network/bridge-model'
import { isModule, isModuleInstance, isModuleObject } from '@xyo-network/module-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { asNodeInstance, isNodeInstance } from '@xyo-network/node-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { HttpBridge } from '../HttpBridge'
import { HttpBridgeConfigSchema } from '../HttpBridgeConfig'

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

    const bridge: BridgeInstance = await HttpBridge.create({
      account: Account.randomSync(),
      config: { name: 'TestBridge', nodeUrl, schema: HttpBridgeConfigSchema, security: { allowAnonymous: true } },
    })

    await bridge?.start?.()
    await memNode.register(bridge)
    await memNode.attach(bridge?.address, true)
    const resolvedBridge = await memNode.resolve(bridge.id)
    expect(resolvedBridge).toBeDefined()

    const rootModule = await bridge?.resolve('XYOPublic')
    expect(rootModule).toBeDefined()

    const remoteNode = asNodeInstance(rootModule, () => `Failed to resolve correct object type [XYOPublic] [${rootModule?.constructor.name}]`)

    const description = await remoteNode.describe()
    expect(description.children).toBeArray()
    expect(description.children?.length).toBeGreaterThan(0)
    expect(description.queries).toBeArray()
    expect(description.queries?.length).toBeGreaterThan(0)

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

    const module = await bridge.resolve('XYOPublic')

    expect(isModule(module)).toBeTrue()
    expect(isModuleObject(module)).toBeTrue()

    const remoteNode = asNodeInstance(module, `Failed to resolve [XYOPublic] - ${module?.address} [${module?.id}] [${module?.constructor.name}]`)

    expect(isNodeInstance(remoteNode)).toBeTrue()
    expect(isModuleInstance(remoteNode)).toBeTrue()

    await memNode3.register(remoteNode)
    await memNode3.attach(remoteNode?.address, true)
    const description = await remoteNode.describe()
    expect(description.children).toBeArray()
    expect(description.children?.length).toBeGreaterThan(0)
    expect(description.queries).toBeArray()
    expect(description.queries?.length).toBeGreaterThan(0)

    // Works if you supply the known address for 'Archivist'
    //const [archivistByAddress] = await memNode.resolve({ address: ['461fd6970770e97d9f66c71658f4b96212581f0b'] })
    //expect(archivistByAddress).toBeDefined()

    /*const mods = await bridge.resolve('*')
    for (const mod of mods) {
      console.log(`module [${mod.address}]: ${mod.config.name}`)
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
