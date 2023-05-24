import { assertEx } from '@xylabs/assert'
import { MemoryNode, NodeModule, NodeWrapper } from '@xyo-network/node'

import { MessageBridge } from '../MessageBridge'
import { MessageBridgeConfigSchema } from '../MessageBridgeConfig'

describe('HttpBridge', () => {
  const baseUrl = `${process.env.API_DOMAIN}` ?? 'http://localhost:8080'
  const cases = [
    ['/', `${baseUrl}`],
    ['/node', `${baseUrl}/node`],
  ]
  it.each(cases)('HttpBridge: %s', async (_, nodeUrl) => {
    const memNode = await MemoryNode.create()

    const bridge = await MessageBridge.create({
      config: { nodeUrl, schema: MessageBridgeConfigSchema, security: { allowAnonymous: true } },
    })

    const wrapper = NodeWrapper.wrap(
      assertEx(
        (await bridge.downResolver.resolve<NodeModule>({ address: [bridge.rootAddress] }))?.pop(),
        `Failed to resolve rootNode [${bridge.rootAddress}]`,
      ),
    )
    await memNode.register(wrapper.module)
    await memNode.attach(wrapper?.address, true)
    const description = await wrapper.describe()
    expect(description.children).toBeArray()
    expect(description.children?.length).toBeGreaterThan(0)
    expect(description.queries).toBeArray()
    expect(description.queries?.length).toBeGreaterThan(0)

    const [archivistByName] = await NodeWrapper.wrap(memNode).resolve({ name: ['Archivist'] })
    expect(archivistByName).toBeDefined()
  })
  it.each(cases)('HttpBridge - Nested: %s', async (_, nodeUrl) => {
    const memNode1 = await MemoryNode.create()
    const memNode2 = await MemoryNode.create()
    const memNode3 = await MemoryNode.create()

    await memNode1.register(memNode2)
    await memNode1.attach(memNode2.address, true)
    await memNode2.register(memNode3)
    await memNode2.attach(memNode3.address, true)

    const bridge = await MessageBridge.create({
      config: { nodeUrl, schema: MessageBridgeConfigSchema, security: { allowAnonymous: true } },
    })

    const wrapper = NodeWrapper.wrap(
      assertEx(
        (await bridge.downResolver.resolve<NodeModule>({ address: [bridge.rootAddress] }))?.pop(),
        `Failed to resolve rootNode [${bridge.rootAddress}]`,
      ),
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
    const memNodeWrapper1 = NodeWrapper.wrap(memNode1)
    const [archivistByName] = await memNodeWrapper1.resolve({ name: ['Archivist'] })
    expect(archivistByName).toBeDefined()
    const [payloadStatsDivinerByName] = await memNodeWrapper1.resolve({ name: ['PayloadStatsDiviner'] })
    expect(payloadStatsDivinerByName).toBeDefined()
    const [boundwitnessStatsDivinerByName] = await memNodeWrapper1.resolve({ name: ['BoundWitnessStatsDiviner'] })
    expect(boundwitnessStatsDivinerByName).toBeDefined()
  })
})
