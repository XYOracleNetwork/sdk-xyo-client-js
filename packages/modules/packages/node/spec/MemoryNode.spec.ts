/* eslint-disable max-statements */
import { delay } from '@xylabs/delay'
import { AccountInstance } from '@xyo-network/account-model'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { MemoryArchivist, MemoryArchivistConfigSchema } from '@xyo-network/archivist'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import {
  ArchivistPayloadDiviner,
  ArchivistPayloadDivinerConfigSchema,
  DivinerModule,
  DivinerWrapper,
  HuriPayload,
  HuriSchema,
} from '@xyo-network/diviner'
import { AbstractModule, Module, ModuleDescription } from '@xyo-network/module'
import { ModuleAttachedEventArgs, NodeConfigSchema } from '@xyo-network/node-model'
import { NodeWrapper } from '@xyo-network/node-wrapper'
import { Account, Payload, PayloadBuilder, PayloadSchema, PayloadWrapper } from '@xyo-network/protocol'

import { MemoryNode } from '../src'

describe('MemoryNode', () => {
  let testAccount0: AccountInstance
  let testAccount1: AccountInstance
  let testAccount2: AccountInstance
  let testAccount3: AccountInstance
  let testAccount4: AccountInstance
  const archivistConfig = { schema: MemoryArchivist.configSchema }
  const nodeConfig = { schema: NodeConfigSchema }
  let node: MemoryNode
  beforeAll(async () => {
    testAccount0 = await Account.create({ phrase: 'testPhrase0' })
    testAccount1 = await Account.create({ phrase: 'testPhrase1' })
    testAccount2 = await Account.create({ phrase: 'testPhrase2' })
    testAccount3 = await Account.create({ phrase: 'testPhrase3' })
    testAccount4 = await Account.create({ phrase: 'testPhrase4' })
    //jest.spyOn(console, 'log').mockImplementation(() => {
    // Stop expected logs from being generated during tests
    //})
  })
  beforeEach(async () => {
    const nodeModule = await MemoryNode.create({ account: testAccount1, config: nodeConfig })
    node = nodeModule
  })
  describe('create', () => {
    it('Creates MemoryNode', async () => {
      const MemoryArchivist = (await import('@xyo-network/archivist')).MemoryArchivist
      const node = await MemoryNode.create()
      const archivist = await MemoryArchivist.create({ config: { name: 'Archivist', schema: MemoryArchivistConfigSchema } })
      const diviner: AbstractModule = await ArchivistPayloadDiviner.create({
        config: { archivist: archivist.address, schema: ArchivistPayloadDivinerConfigSchema },
      })
      await node.register(archivist)
      await node.attach(archivist.address, true)
      await node.register(diviner)
      await node.attach(diviner.address, true)
      expect(node.registered()).toBeArrayOfSize(2)
      expect(await node.attached()).toBeArrayOfSize(2)
      const foundArchivist = await NodeWrapper.wrap(node, testAccount0).resolve(archivist.address)
      expect(foundArchivist).toBeDefined()
      const foundNamedArchivist = await NodeWrapper.wrap(node, testAccount0).resolve('Archivist')
      expect(foundNamedArchivist).toBeDefined()
      expect(foundArchivist?.address).toBe(archivist.address)
      const testPayload = new PayloadBuilder<Payload<{ schema: PayloadSchema; test: boolean }>>({ schema: PayloadSchema })
        .fields({ test: true })
        .build()

      const foundArchivistWrapper = foundArchivist ? ArchivistWrapper.wrap(foundArchivist) : undefined
      await foundArchivistWrapper?.insert([testPayload])

      /*const subscribeQuery: AbstractModuleSubscribeQuery = { payloads: [testPayload], schema: AbstractModuleSubscribeQuerySchema }
  await foundArchivist?.query(subscribeQuery)*/

      const payloads = await foundArchivistWrapper?.all()
      expect(payloads?.length).toBe(1)

      if (payloads && payloads[0]) {
        const huri = await PayloadWrapper.hashAsync(payloads[0])
        const huriPayload: HuriPayload = { huri: [huri], schema: HuriSchema }
        const module = (await NodeWrapper.wrap(node, testAccount0).resolve(diviner.address)) as DivinerModule | undefined
        const foundDiviner = module ? DivinerWrapper.wrap(module) : null
        expect(foundDiviner).toBeDefined()
        if (foundDiviner) {
          const foundDivinerWrapper = DivinerWrapper.wrap(foundDiviner)
          const payloads = await foundDivinerWrapper.divine([huriPayload])
          expect(payloads?.length).toBe(1)
          expect(payloads[0]).toBeDefined()
          if (payloads?.length === 1 && payloads[0]) {
            expect(await PayloadWrapper.hashAsync(payloads[0])).toBe(huri)
          }
        }
      }
    })
    /*describe('with autoAttachExternallyResolved true', () => {
      it('attaches external modules to internal resolver', async () => {
        // Arrange
        // Create a MemoryNode with no modules in the internal
        // resolver and one module in the external resolver
        const resolver = new CompositeModuleResolver()
        const internalResolver = new CompositeModuleResolver()
        const params: MemoryNodeParams = {
          config: { schema: NodeConfigSchema },
          internalResolver,
          resolver,
        }
        const module = await MemoryArchivist.create()
        const filter = { address: [module.address] }
        resolver.add(module)
        // No modules exist in internal resolver
        expect(await internalResolver.resolve(filter)).toBeArrayOfSize(0)
        // Module exists in external resolver
        expect(await resolver.resolve(filter)).toBeArrayOfSize(1)
        const node = await MemoryNode.create(params)
        // No modules are attached
        expect(await node.attached()).toBeArrayOfSize(0)

        // Act
        // Query for unattached module (by address) that exists in
        // external resolver
        expect(await node.resolve(filter)).toBeArrayOfSize(1)

        // Assert
        // Module is now attached
        expect(await node.attached()).toBeArrayOfSize(1)
        // Module exists in internal resolver
        expect(await internalResolver.resolve(filter)).toBeArrayOfSize(1)
        // Module still exists in external resolver
        expect(await resolver.resolve(filter)).toBeArrayOfSize(1)
      })
    })*/
  })
  describe('register', () => {
    it('registers module', async () => {
      const module = await MemoryArchivist.create()
      await node.register(module)
    })
  })
  describe('registered', () => {
    describe('with no modules registered', () => {
      it('returns empty array', () => {
        const result = node.registered()
        expect(result).toBeArrayOfSize(0)
      })
    })
    describe('with modules registered', () => {
      let module: AbstractModule
      beforeEach(async () => {
        module = await MemoryArchivist.create()
        await node.register(module)
      })
      it('lists addresses of registered modules', () => {
        const result = node.registered()
        expect(result).toBeArrayOfSize(1)
        expect(result).toEqual([module.address])
      })
    })
  })
  describe('attach', () => {
    let module: AbstractModule
    beforeEach(async () => {
      module = await MemoryArchivist.create()
      await node.register(module)
    })
    it('attaches module', async () => {
      await node.attach(module.address, true)
    })
    it('emits event on module attach', async () => {
      let eventDone = false
      return await new Promise<void>((resolve, reject) => {
        node.on('moduleAttached', (args) => {
          const { module } = args as ModuleAttachedEventArgs
          expect(module).toBeObject()
          expect(module.address).toBe(module.address)
          expect(module).toBe(module)
          eventDone = true
        })
        node
          .attach(module.address, true)
          .then(async () => {
            //wait for up to 5 seconds
            let waitFrames = 50
            while (waitFrames) {
              if (eventDone) {
                resolve()
                return
              }
              await delay(100)
              waitFrames--
            }
            reject('Event not fired [within 5 seconds]')
          })
          .catch(() => {
            reject('Attach failed')
          })
      })
    })
  })
  describe('attached', () => {
    let module: AbstractModule
    beforeEach(async () => {
      module = await MemoryArchivist.create()
      await node.register(module)
    })
    describe('with no modules attached', () => {
      it('returns empty array', async () => {
        const result = await node.attached()
        expect(result).toBeArrayOfSize(0)
      })
    })
    describe('with modules attached', () => {
      it('lists addresses of attached modules', async () => {
        await node.attach(module.address, true)
        const result = await node.attached()
        expect(result).toBeArrayOfSize(1)
        expect(result).toEqual([module.address])
      })
    })
  })
  describe('detach', () => {
    let module: AbstractModule
    beforeEach(async () => {
      module = await MemoryArchivist.create()
      await node.register(module)
      await node.attach(module.address, true)
    })
    it('deregisters existing module', async () => {
      await node.detach(module.address)
    })
    /*it('allows deregistering non-existent module', () => {
      node.detach('4a15a6c96665931b76c1d2a587ea1132dbfdc266')
    })*/
  })
  describe('registeredModules', () => {
    let module: AbstractModule
    beforeEach(async () => {
      module = await MemoryArchivist.create()
    })
    describe('with no modules registered', () => {
      it('returns empty array', () => {
        const modules = node.registeredModules()
        expect(modules).toBeArrayOfSize(0)
      })
    })
    describe('with modules registered', () => {
      it('returns registered modules', async () => {
        await node.register(module)
        const modules = node.registeredModules()
        expect(modules).toBeArrayOfSize(1)
        expect(modules).toContain(module)
      })
    })
  })
  describe('unregister', () => {
    it('un-registers module', async () => {
      const module = await MemoryArchivist.create()
      await node.register(module)
      expect(node.registeredModules()).toContain(module)
      await node.unregister(module)
      expect(node.registeredModules()).not.toContain(module)
    })
  })
  describe('description', () => {
    const validateModuleDescription = (description: ModuleDescription) => {
      expect(description).toBeObject()
      expect(description.address).toBeString()
      expect(description.queries).toBeArray()
      description.queries.map((query) => {
        expect(query).toBeString()
      })
    }
    describe('node without child modules', () => {
      it('describes node alone', async () => {
        const wrapper = NodeWrapper.wrap(node, testAccount0)
        const description = await wrapper.describe()
        validateModuleDescription(description)
        expect(description.children).toBeArrayOfSize(0)
      })
      it('serializes to JSON consistently', async () => {
        const wrapper = NodeWrapper.wrap(node, testAccount0)
        const description = await wrapper.describe()
        expect(prettyPrintDescription(description)).toMatchSnapshot()
      })
    })
    describe('node with child modules', () => {
      beforeEach(async () => {
        const modules = await Promise.all([
          await MemoryArchivist.create({ account: testAccount2, config: { ...archivistConfig, name: 'testAccount2' } }),
          await MemoryArchivist.create({ account: testAccount3, config: { ...archivistConfig, name: 'testAccount3' } }),
        ])
        await Promise.all(
          modules.map(async (mod) => {
            expect(await node.register(mod)).toBeDefined()
            expect(await node.attach(mod.address, true)).toEqual(mod.address)
            expect(await node.detach(mod.address)).toEqual(mod.address)
            if (mod.config.name) {
              expect(await node.attach(mod.config.name, true)).toEqual(mod.address)
              expect(await node.detach(mod.config.name)).toEqual(mod.address)
            }
            expect(await node.attach(mod.address, true)).toEqual(mod.address)
          }),
        )
      })
      it('describes node and child modules', async () => {
        const wrapper = NodeWrapper.wrap(node, testAccount0)
        const description = await wrapper.describe()
        validateModuleDescription(description)
        expect(description.children).toBeArrayOfSize(2)
        //description.children?.map(validateModuleDescription)
      })
      it('serializes to JSON consistently', async () => {
        const wrapper = NodeWrapper.wrap(node, testAccount0)
        const description = await wrapper.describe()
        expect(prettyPrintDescription(description)).toMatchSnapshot()
      })
    })
    describe('node with nested nodes and modules', () => {
      beforeEach(async () => {
        const nestedNode = await MemoryNode.create({ account: testAccount2, config: nodeConfig })
        const nestedModules = await Promise.all([await MemoryArchivist.create({ account: testAccount3, config: archivistConfig })])
        nestedModules.map(async (mod) => {
          await nestedNode.register(mod)
          await nestedNode.attach(mod.address, true)
        })
        const rootModules: AbstractModule[] = await Promise.all([await MemoryArchivist.create({ account: testAccount4, config: archivistConfig })])
        rootModules.push(nestedNode)
        rootModules.map(async (mod) => {
          await node.register(mod)
          await node.attach(mod.address, true)
        })
      })
      it('describes node and all nested nodes and child modules', async () => {
        const memoryNode = await MemoryNode.create()
        const archivist1 = await MemoryArchivist.create()
        const archivist2 = await MemoryArchivist.create()
        const wrapper = NodeWrapper.wrap(memoryNode, testAccount0)
        await memoryNode.register(archivist1)
        await memoryNode.attach(archivist1.address, true)
        await memoryNode.register(archivist2)
        await memoryNode.attach(archivist2.address, true)
        const description = await wrapper.describe()
        validateModuleDescription(description)
        expect(description.children).toBeArrayOfSize(2)
        //description.children?.map(validateModuleDescription)
      })
      it('serializes to JSON consistently', async () => {
        const wrapper = NodeWrapper.wrap(node, testAccount0)
        const description = await wrapper.describe()
        expect(prettyPrintDescription(description)).toMatchSnapshot()
      })
    })
  })
  describe('discover', () => {
    const archivistConfig = { schema: MemoryArchivist.configSchema }
    const validateDiscoveryResponse = (mod: Module, response: Payload[]) => {
      expect(response).toBeArray()
      const address = response.find((p) => p.schema === AddressSchema) as AddressPayload
      expect(address).toBeObject()
      expect(address.address).toEqual(mod.address)
      const config = response.find((p) => p.schema === mod.config.schema)
      expect(config).toBeObject()
      expect(config).toEqual(mod.config)
      const queries = response.filter((p) => mod.queries.includes(p.schema))
      expect(queries.length).toBeGreaterThanOrEqual(0)
      queries.map((query) => {
        expect(query).toBeObject()
      })
    }
    describe('node without child modules', () => {
      it('describes node alone', async () => {
        const description = await node.discover()
        validateDiscoveryResponse(node, description)
      })
    })
    describe('node with child modules', () => {
      it('describes node and child modules', async () => {
        const memoryNode = await MemoryNode.create()
        const modules = await Promise.all([
          await MemoryArchivist.create({ account: testAccount2, config: archivistConfig }),
          await MemoryArchivist.create({ account: testAccount3, config: archivistConfig }),
        ])
        await Promise.all(
          modules.map(async (mod) => {
            await memoryNode.register(mod)
            await memoryNode.attach(mod.address, true)
          }),
        )
        const discover = await memoryNode.discover()

        const address0 = discover.find((p) => p.schema === AddressSchema && (p as AddressPayload).address === modules[0].address) as AddressPayload
        expect(address0).toBeObject()
        const address1 = discover.find((p) => p.schema === AddressSchema && (p as AddressPayload).address === modules[1].address) as AddressPayload
        expect(address1).toBeObject()
      })
    })
    describe('node with nested nodes and modules', () => {
      beforeEach(async () => {
        node = await MemoryNode.create()
        const attachEvents: Module[] = []
        node.on('moduleAttached', (args) => {
          const { module } = args as ModuleAttachedEventArgs
          attachEvents.push(module)
        })
        const nestedNode = await MemoryNode.create({ account: testAccount2, config: nodeConfig })
        const nestedModules = await Promise.all([await MemoryArchivist.create({ account: testAccount3, config: archivistConfig })])
        await Promise.all(
          nestedModules.map(async (mod) => {
            await nestedNode.register(mod)
            await nestedNode.attach(mod.address, true)
          }),
        )
        const rootModules: AbstractModule[] = await Promise.all([await MemoryArchivist.create({ account: testAccount4, config: archivistConfig })])
        rootModules.push(nestedNode)
        await Promise.all(
          rootModules.map(async (mod) => {
            await node.register(mod)
            await node.attach(mod.address, true)
          }),
        )
        expect(attachEvents.includes(nestedNode)).toBeTrue()
        expect(attachEvents.includes(node)).toBeFalse()
        expect(nestedModules.length).toBe(1)
        nestedModules.forEach((nestedModule) => {
          expect(attachEvents.includes(nestedModule)).toBeTrue()
        })
        expect(rootModules.length).toBe(2)
        rootModules.forEach((rootModule) => {
          expect(attachEvents.includes(rootModule)).toBeTrue()
        })
        const eventAddresses = attachEvents.map((module) => module.address)
        expect(eventAddresses.length).toBe(3)
      })
      it('describes node and all nested nodes and child modules', async () => {
        const description = await node.discover()
        validateDiscoveryResponse(node, description)
      })
    })
  })
})

const prettyPrintDescription = (description: ModuleDescription) => {
  return JSON.stringify(description, null, 2)
}
