import '@xylabs/vitest-extended'

import type { HttpBridgeConfig, HttpBridgeParams } from '@xyo-network/bridge-http'
import { HttpBridge, HttpBridgeConfigSchema } from '@xyo-network/bridge-http'
import type { ModuleDescriptionPayload } from '@xyo-network/module-model'
import { ModuleDescriptionSchema } from '@xyo-network/module-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { asAttachableNodeInstance } from '@xyo-network/node-model'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'
import { getPort } from 'get-port-please'
import {
  beforeAll,
  beforeEach,
  describe, expect, it,
} from 'vitest'

import type { HttpBridgeExpressConfig, HttpBridgeExpressParams } from '../HttpBridge.ts'
import { HttpBridgeExpress, HttpBridgeExpressConfigSchema } from '../HttpBridge.ts'

const account = 'random'
const hostSchema = HttpBridgeExpressConfigSchema
const clientSchema = HttpBridgeConfigSchema
const security = { allowAnonymous: true }

/**
 * @group module
 * @group bridge
 */
describe('HttpBridgeExpress', () => {
  let port: number
  let url: string
  let hostBridge: HttpBridgeExpress<HttpBridgeExpressParams>
  let clientBridge: HttpBridge<HttpBridgeParams>
  let hostNode: MemoryNode
  let clientNode: MemoryNode
  let hostSibling: MemoryNode
  let clientSibling: MemoryNode
  let hostDescendent: MemoryNode
  let clientDescendent: MemoryNode

  beforeAll(async () => {
    // Create Host/Client Nodes
    hostNode = await MemoryNode.create({ account })
    clientNode = await MemoryNode.create({ account })

    // Create Host/Client Bridges
    port = await getPort()
    url = `http://localhost:${port}`

    const host: HttpBridgeExpressConfig['host'] = { port }
    const client: HttpBridgeConfig['client'] = { discoverRoots: 'start', url }
    hostBridge = await HttpBridgeExpress.create({
      account,
      config: {
        host, name: 'TestBridgeHost', schema: hostSchema, security,
      },
    })
    clientBridge = await HttpBridge.create({
      account,
      config: {
        client, name: 'TestBridgeClient', schema: clientSchema, security,
      },
    })

    // Register Host/Client Bridges
    await hostNode.register(hostBridge)
    await hostNode.attach(hostBridge.address, true)
    await clientNode.register(clientBridge)
    await clientNode.attach(clientBridge.address, true)

    // Create Host/Client Sibling Nodes
    hostSibling = await MemoryNode.create({ account })
    clientSibling = await MemoryNode.create({ account })

    // Register Host/Client Siblings
    await hostNode.register(hostSibling)
    await hostNode.attach(hostSibling.address, true)
    await clientNode.register(clientSibling)
    await clientNode.attach(clientSibling.address, true)

    // Create Host/Client Descendent Nodes
    hostDescendent = await MemoryNode.create({ account })
    clientDescendent = await MemoryNode.create({ account })

    // Register Host/Client Siblings
    await hostSibling.register(hostDescendent)
    await hostSibling.attach(hostDescendent.address, true)
    await clientSibling.register(clientDescendent)
    await clientSibling.attach(clientDescendent.address, true)
  })

  describe('exposed module behavior', () => {
    const cases: [string, () => MemoryNode][] = [
      ['parent', () => hostNode],
      ['sibling', () => hostSibling],
      ['descendent', () => hostDescendent],
    ]
    describe.each(cases)('with %s module', (_, getSutModule) => {
      let exposedMod: MemoryNode
      beforeEach(() => {
        exposedMod = getSutModule()
      })
      describe('before expose', () => {
        it('should not be exposed', async () => {
          expect(await hostBridge.exposed()).toBeEmpty()
        })
        it('should not be resolvable', async () => {
          expect(await clientBridge.resolve(exposedMod.address)).toBeUndefined()
        })
      })
      describe('after expose', () => {
        beforeEach(async () => {
          await hostBridge.expose(exposedMod.address)
        })
        it('should be exposed on host', async () => {
          expect((await hostBridge.exposed()).includes(exposedMod.address)).toBeTrue()
        })
        it.skip('should be resolvable from client', async () => {
          // TODO: Implement .connect on HttpBridgeExpress and call here before resolving
          const result = await clientBridge.resolve(exposedMod.address)
          expect(result).toBeDefined()
          expect(asAttachableNodeInstance(result, () => `Failed to resolve correct object type [${result?.constructor.name}]`)).toBeDefined()
        })
        it.skip('should be queryable from client', async () => {
          const bridgedHostedModule = await clientBridge.resolve(exposedMod.address)
          expect(bridgedHostedModule).toBeDefined()

          const bridgedHostedNode = asAttachableNodeInstance(
            bridgedHostedModule,
            () => `Failed to resolve correct object type [${bridgedHostedModule?.constructor.name}]`,
          )

          if (bridgedHostedNode) {
            const state = await bridgedHostedNode.state()
            const description = state.find(isPayloadOfSchemaType<ModuleDescriptionPayload>(ModuleDescriptionSchema))
            expect(description?.children).toBeArray()
            expect(description?.queries).toBeArray()
            expect(description?.queries?.length).toBeGreaterThan(0)
          }
        })
      })
      describe('after unexpose', () => {
        beforeEach(async () => {
          await hostBridge.expose(exposedMod.address)
          await hostBridge.unexpose(exposedMod.address)
        })
        it('should not be exposed', async () => {
          expect(await hostBridge.exposed()).toBeEmpty()
        })
        it('should not be resolvable', async () => {
          expect(await clientBridge.resolve(exposedMod.address)).toBeUndefined()
        })
      })
    })
  })
})
