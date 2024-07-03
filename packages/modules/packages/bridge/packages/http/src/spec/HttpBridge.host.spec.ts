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
  let port: number
  let url: string
  let hostBridge: HttpBridge<HttpBridgeParams>
  let clientBridge: HttpBridge<HttpBridgeParams>
  beforeEach(async () => {
    port = await getPort()
    url = `http://localhost:${port}`
    const account = 'random'
    const schema = HttpBridgeConfigSchema
    const security = { allowAnonymous: true }
    const host: HttpBridgeConfig['host'] = { port }
    const client: HttpBridgeConfig['client'] = { discoverRoots: 'start', url }
    hostBridge = await HttpBridge.create({ account, config: { host, name: 'TestBridgeHost', schema, security } })
    clientBridge = await HttpBridge.create({ account, config: { client, name: 'TestBridgeClient', schema, security } })
  })

  describe('HttpBridge', () => {
    describe('By name', () => {
      it('should handle the case by name', () => {
        // Add your test logic here
      })
    })

    describe('By address', () => {
      it('should handle the case by address', () => {
        // Add your test logic here
      })
    })

    describe('By exposed/unexposed', () => {
      describe('Pre Exposed', () => {
        it('should handle the case when pre exposed', () => {
          // Add your test logic here
        })
      })

      describe('Post Exposed', () => {
        it('should handle the case when post exposed', () => {
          // Add your test logic here
        })
      })

      describe('Post Unexposed', () => {
        it('should handle the case when post unexposed', () => {
          // Add your test logic here
        })
      })
    })

    describe('By parent/sibling/child/grandchild', () => {
      describe('ParentNode', () => {
        it('should handle the case for ParentNode', () => {
          // Add your test logic here
        })

        describe('Bridge', () => {
          it('should handle the case for Bridge', () => {
            // Add your test logic here
          })
        })

        describe('SiblingNode', () => {
          it('should handle the case for SiblingNode', () => {
            // Add your test logic here
          })

          describe('ChildNode', () => {
            it('should handle the case for ChildNode', () => {
              // Add your test logic here
            })
          })
        })
      })

      describe('GrandchildNode', () => {
        it('should handle the case for GrandchildNode', () => {
          // Add your test logic here
        })
      })
    })
  })
})
