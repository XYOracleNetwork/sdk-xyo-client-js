import { assertEx } from '@xylabs/assert'
import { HDWallet } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { ArchivistInstance, asArchivistInstance } from '@xyo-network/archivist'
import { MemoryNode, NodeModule, NodeWrapper } from '@xyo-network/node'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { HttpBridge } from '../HttpBridge'
import { HttpBridgeConfigSchema } from '../HttpBridgeConfig'

describe('HttpBridge', () => {
  const baseUrl = `${process.env.API_DOMAIN}` ?? 'http://localhost:8080'
  let wrapperAccount: AccountInstance
  console.log(`HttpBridge:baseUrl ${baseUrl}`)
  const cases = [
    ['/', `${baseUrl}`],
    /*['/node', `${baseUrl}/node`],*/
  ]

  beforeAll(async () => {
    wrapperAccount = await HDWallet.random()
  })

  it.each(cases)('HttpBridge: %s', async (_, nodeUrl) => {
    const memNode = await MemoryNode.create()

    const bridge = await HttpBridge.create({
      account: await HDWallet.random(),
      config: { nodeUrl, schema: HttpBridgeConfigSchema, security: { allowAnonymous: true } },
    })

    const wrapper = NodeWrapper.wrap(
      assertEx(
        (await bridge.downResolver.resolve<NodeModule>({ address: [await bridge.getRootAddress()] }))?.pop(),
        `Failed to resolve rootNode [${await bridge.getRootAddress()}]`,
      ),
      wrapperAccount,
    )

    await memNode.register(wrapper.module)
    await memNode.attach(wrapper?.address, true)
    const description = await wrapper.describe()
    expect(description.children).toBeArray()
    expect(description.children?.length).toBeGreaterThan(0)
    expect(description.queries).toBeArray()
    expect(description.queries?.length).toBeGreaterThan(0)

    const [archivistByName] = await memNode.resolve({ name: ['Archivist'] })
    const archivistInstance = asArchivistInstance(archivistByName) as ArchivistInstance
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
    const memNode1 = await MemoryNode.create({ account: await HDWallet.random(), config: { schema: 'network.xyo.node.config' } })
    const memNode2 = await MemoryNode.create({ account: await HDWallet.random(), config: { schema: 'network.xyo.node.config' } })
    const memNode3 = await MemoryNode.create({ account: await HDWallet.random(), config: { schema: 'network.xyo.node.config' } })

    await memNode1.register(memNode2)
    await memNode1.attach(memNode2.address, true)
    await memNode2.register(memNode3)
    await memNode2.attach(memNode3.address, true)

    const bridge = await HttpBridge.create({
      account: await HDWallet.random(),
      config: { nodeUrl, schema: HttpBridgeConfigSchema, security: { allowAnonymous: true } },
    })

    const wrapper = NodeWrapper.wrap(
      assertEx(
        (await bridge.downResolver.resolve<NodeModule>({ address: [await bridge.getRootAddress()] }))?.pop(),
        `Failed to resolve rootNode [${await bridge.getRootAddress()}]`,
      ),
      wrapperAccount,
    )

    await memNode3.register(wrapper.module)
    await memNode3.attach(wrapper?.address, true)
    const description = await wrapper.describe()
    expect(description.children).toBeArray()
    expect(description.children?.length).toBeGreaterThan(0)
    expect(description.queries).toBeArray()
    expect(description.queries?.length).toBeGreaterThan(0)

    // Works if you supply the known address for 'Archivist'
    //const [archivistByAddress] = await memNode.resolve({ address: ['461fd6970770e97d9f66c71658f4b96212581f0b'] })
    //expect(archivistByAddress).toBeDefined()

    // Fails to resolve
    const memNodeWrapper1 = NodeWrapper.wrap(memNode1, wrapperAccount)
    const [archivistByName] = await memNodeWrapper1.resolve({ name: ['Archivist'] })
    expect(archivistByName).toBeDefined()
    const [payloadStatsDivinerByName] = await memNodeWrapper1.resolve({ name: ['PayloadStatsDiviner'] })
    expect(payloadStatsDivinerByName).toBeDefined()
    const [boundwitnessStatsDivinerByName] = await memNodeWrapper1.resolve({ name: ['BoundWitnessStatsDiviner'] })
    expect(boundwitnessStatsDivinerByName).toBeDefined()
  })
})
