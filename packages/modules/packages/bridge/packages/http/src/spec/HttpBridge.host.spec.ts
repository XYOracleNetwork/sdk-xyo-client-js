/* eslint-disable max-nested-callbacks */
import { Account } from '@xyo-network/account'
import { ModuleDescriptionPayload, ModuleDescriptionSchema } from '@xyo-network/module-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { asAttachableNodeInstance } from '@xyo-network/node-model'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'
import { getPort } from 'get-port-please'

import { HttpBridgeConfig, HttpBridgeConfigSchema } from '../HttpBridgeConfig'
import { HttpBridge, HttpBridgeParams } from '../HttpBridgeFull'

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
    const hostNode = await MemoryNode.create({ account: Account.randomSync() })
    const clientNode = await MemoryNode.create({ account: Account.randomSync() })
    const hostedNode = await MemoryNode.create({ account: Account.randomSync() })

    await hostNode.register(hostedNode)
    await hostNode.attach(hostedNode.address, true)

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
    await hostNode.attach(hostBridge.address, true)

    const clientBridge = await HttpBridge.create({
      account: 'random',
      config: {
        client: { discoverRoots: 'start', url },
        name: 'TestBridgeClient',
        schema: HttpBridgeConfigSchema,
        security: { allowAnonymous: true },
      },
    })

    await clientNode.register(clientBridge)
    await clientNode.attach(clientBridge.address, true)

    const resolvedHostBridge = await hostNode.resolve(hostBridge.id)
    expect(resolvedHostBridge).toBeDefined()

    await hostBridge.expose(hostedNode.address)

    const bridgedHostedModule = await hostBridge.resolve(hostedNode.address)
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

/**
 * @group module
 * @group bridge
 */
describe('HttpBridge', () => {
  const account = 'random'
  const schema = HttpBridgeConfigSchema
  const security = { allowAnonymous: true }
  let port: number
  let url: string
  let hostBridge: HttpBridge<HttpBridgeParams>
  let clientBridge: HttpBridge<HttpBridgeParams>
  let hostNode: MemoryNode
  let clientNode: MemoryNode
  let mod: MemoryNode
  let clientSibling: MemoryNode
  let hostDescendent: MemoryNode
  let clientDescendent: MemoryNode
  beforeEach(async () => {
    // Create Host/Client Nodes
    hostNode = await MemoryNode.create({ account })
    clientNode = await MemoryNode.create({ account })

    // Create Host/Client Bridges
    port = await getPort()
    url = `http://localhost:${port}`

    const host: HttpBridgeConfig['host'] = { port }
    const client: HttpBridgeConfig['client'] = { discoverRoots: 'start', url }
    hostBridge = await HttpBridge.create({ account, config: { host, name: 'TestBridgeHost', schema, security } })
    clientBridge = await HttpBridge.create({ account, config: { client, name: 'TestBridgeClient', schema, security } })

    // Register Host/Client Bridges
    await hostNode.register(hostBridge)
    await hostNode.attach(hostBridge.address, true)
    await clientNode.register(clientBridge)
    await clientNode.attach(clientBridge.address, true)

    // Create Host/Client Sibling Nodes
    mod = await MemoryNode.create({ account })
    clientSibling = await MemoryNode.create({ account })

    // Register Host/Client Siblings
    await hostNode.register(mod)
    await hostNode.attach(mod.address, true)
    await clientNode.register(clientSibling)
    await clientNode.attach(clientSibling.address, true)

    // Create Host/Client Descendent Nodes
    hostDescendent = await MemoryNode.create({ account })
    clientDescendent = await MemoryNode.create({ account })

    // Register Host/Client Siblings
    await mod.register(hostDescendent)
    await mod.attach(hostDescendent.address, true)
    await clientSibling.register(clientDescendent)
    await clientSibling.attach(clientDescendent.address, true)
  })

  describe('exposed module behavior', () => {
    const cases: [string, () => MemoryNode][] = [
      ['parent', () => hostNode],
      ['sibling', () => mod],
      ['descendent', () => hostDescendent],
    ]
    describe.each(cases)('with %s module', (_, getSutModule) => {
      mod = getSutModule()
      describe('before expose', () => {
        it('should not be exposed', async () => {
          expect(await hostBridge.exposed()).toBeEmpty()
        })
        it('should not be resolvable', async () => {
          expect(await clientBridge.resolve(mod.address)).toBeUndefined()
        })
      })
      describe('after expose', () => {
        beforeEach(async () => {
          await hostBridge.expose(mod.address)
        })
        it('should be exposed', async () => {
          const address = hostBridge.address
          const exposed = (await hostBridge.exposed()).toSorted()
          const parents = (await hostBridge.parents()).map((mod) => mod.address).toSorted()
          const sibblings = (await hostBridge.siblings()).map((mod) => mod.address).toSorted()
          expect(await hostBridge.exposed()).toEqual([mod.address])
        })
        it('should be resolvable', async () => {
          const result = await clientBridge.resolve(mod.address)
          const foo = await clientBridge.resolve('*')
          expect(result).toBeDefined()
          expect(asAttachableNodeInstance(result, () => `Failed to resolve correct object type [${result?.constructor.name}]`)).toBeDefined()
        })
        it.skip('should be queryable', async () => {
          await Promise.reject('TODO: Query module via proxy')
        })
      })
      describe('after unexpose', () => {
        beforeEach(async () => {
          await hostBridge.expose(mod.address)
          await hostBridge.unexpose(mod.address)
        })
        it('should not be exposed', async () => {
          expect(await hostBridge.exposed()).toBeEmpty()
        })
        it('should not be resolvable', async () => {
          expect(await clientBridge.resolve(mod.address)).toBeUndefined()
        })
      })
    })
  })
})
