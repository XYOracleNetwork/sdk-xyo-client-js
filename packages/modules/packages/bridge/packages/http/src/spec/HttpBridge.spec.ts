import { assertEx } from '@xylabs/assert'
import { AxiosJson } from '@xyo-network/axios'
import { MemoryNode, NodeModule, NodeWrapper } from '@xyo-network/node'

import { HttpBridge } from '../HttpBridge'
import { HttpBridgeConfigSchema } from '../HttpBridgeConfig'

test('HttpBridge', async () => {
  const baseURL = `${process.env.API_DOMAIN}` ?? 'http://localhost:8080'
  const memNode = await MemoryNode.create()

  const bridge = await HttpBridge.create({
    axios: new AxiosJson({ baseURL }),
    config: { nodeUri: '/node', schema: HttpBridgeConfigSchema, security: { allowAnonymous: true } },
  })

  const wrapper = NodeWrapper.wrap(
    assertEx(
      (await bridge.downResolver.resolve<NodeModule>({ address: [bridge.rootAddress] }))?.pop(),
      `Failed to resolve rootNode [${bridge.rootAddress}]`,
    ),
  )
  await memNode.register(wrapper.module).attach(wrapper?.address, true)
  const description = await wrapper.describe()
  expect(description.children).toBeArray()
  expect(description.children?.length).toBeGreaterThan(0)
  expect(description.queries).toBeArray()
  expect(description.queries?.length).toBeGreaterThan(0)

  const [archivistByName] = await NodeWrapper.wrap(memNode).resolve({ name: ['Archivist'] })
  expect(archivistByName).toBeDefined()
})

test('HttpBridge - Nested', async () => {
  const baseURL = `${process.env.API_DOMAIN}` ?? 'http://localhost:8080'
  const memNode1 = await MemoryNode.create()
  const memNode2 = await MemoryNode.create()
  const memNode3 = await MemoryNode.create()

  await memNode1.register(memNode2).attach(memNode2.address, true)
  await memNode2.register(memNode3).attach(memNode3.address, true)

  const bridge = await HttpBridge.create({
    axios: new AxiosJson({ baseURL }),
    config: { nodeUri: '/node', schema: HttpBridgeConfigSchema, security: { allowAnonymous: true } },
  })

  const wrapper = NodeWrapper.wrap(
    assertEx(
      (await bridge.downResolver.resolve<NodeModule>({ address: [bridge.rootAddress] }))?.pop(),
      `Failed to resolve rootNode [${bridge.rootAddress}]`,
    ),
  )

  await memNode3.register(wrapper.module).attach(wrapper?.address, true)
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
