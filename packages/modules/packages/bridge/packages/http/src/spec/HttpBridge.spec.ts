import { Account } from '@xyo-network/account'
import { asArchivistInstance } from '@xyo-network/archivist'
import { BridgeInstance } from '@xyo-network/bridge-model'
import { isModule, isModuleInstance, isModuleObject } from '@xyo-network/module-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { asNodeInstance, isNodeInstance } from '@xyo-network/node-model'
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
      config: { nodeUrl, schema: HttpBridgeConfigSchema, security: { allowAnonymous: true } },
    })

    await bridge?.start?.()

    const remoteNode = asNodeInstance(
      (await bridge.resolve({ address: [await bridge.getRootAddress()] }))?.pop(),
      `Failed to resolve rootNode [${await bridge.getRootAddress()}]`,
    )

    await memNode.register(remoteNode)
    await memNode.attach(remoteNode?.address, true)
    const description = await remoteNode.describe()
    expect(description.children).toBeArray()
    expect(description.children?.length).toBeGreaterThan(0)
    expect(description.queries).toBeArray()
    expect(description.queries?.length).toBeGreaterThan(0)

    const archivistByName = await memNode.resolve('Archivist')
    expect(archivistByName).toBeDefined()
    const archivistInstance = asArchivistInstance(archivistByName, 'Failed to cast archivist')
    expect(archivistInstance).toBeDefined()
    const knownPayload = PayloadWrapper.parse({ schema: 'network.xyo.test' })?.payload() as Payload
    expect(knownPayload).toBeDefined()
    const knownHash = await PayloadWrapper.hashAsync(knownPayload as Payload)
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

    const module = (await bridge.resolve({ address: [await bridge.getRootAddress()] }))?.pop()

    expect(isModule(module)).toBeTrue()
    expect(isModuleObject(module)).toBeTrue()

    const remoteNode = asNodeInstance(module, `Failed to resolve rootNode [${await bridge.getRootAddress()}]`)

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

    // Fails to resolve
    const [archivistByName] = await memNode1.resolve({ name: ['Archivist'] })
    expect(archivistByName).toBeDefined()
    const [payloadStatsDivinerByName] = await memNode1.resolve({ name: ['PayloadStatsDiviner'] })
    expect(payloadStatsDivinerByName).toBeDefined()
    const [boundwitnessStatsDivinerByName] = await memNode1.resolve({ name: ['BoundWitnessStatsDiviner'] })
    expect(boundwitnessStatsDivinerByName).toBeDefined()
  })
})
