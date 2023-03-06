/* eslint-disable max-statements */
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { MemoryArchivist, MemoryArchivistConfigSchema } from '@xyo-network/archivist'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import {
  ArchivistPayloadDiviner,
  DivinerModule,
  DivinerWrapper,
  XyoArchivistPayloadDivinerConfigSchema,
  XyoHuriPayload,
  XyoHuriSchema,
} from '@xyo-network/diviner'
import { AbstractModule, Module, ModuleDescription } from '@xyo-network/module'
import { Account, PayloadWrapper, XyoPayload, XyoPayloadBuilder, XyoPayloadSchema } from '@xyo-network/protocol'

import { NodeConfigSchema } from '../Config'
import { MemoryNode } from '../MemoryNode'
import { NodeWrapper } from '../NodeWrapper'

describe('MemoryNode', () => {
  const testAccount1 = new Account({ phrase: 'testPhrase1' })
  const testAccount2 = new Account({ phrase: 'testPhrase2' })
  const testAccount3 = new Account({ phrase: 'testPhrase3' })
  const testAccount4 = new Account({ phrase: 'testPhrase4' })
  const archivistConfig = { schema: MemoryArchivistConfigSchema }
  const nodeConfig = { schema: NodeConfigSchema }
  let node: MemoryNode
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {
      // Stop expected logs from being generated during tests
    })
  })
  beforeEach(async () => {
    node = await MemoryNode.create({ account: testAccount1, config: nodeConfig })
  })
  describe('create', () => {
    it('Creates MemoryNode', async () => {
      const XyoMemoryArchivist = (await import('@xyo-network/archivist')).MemoryArchivist
      const node = await MemoryNode.create()
      const archivist = await XyoMemoryArchivist.create()
      const diviner: AbstractModule = await ArchivistPayloadDiviner.create({
        config: { archivist: archivist.address, schema: XyoArchivistPayloadDivinerConfigSchema },
      })
      await node.register(archivist).attach(archivist.address, true)
      await node.register(diviner).attach(diviner.address, true)
      expect(node.registered()).toBeArrayOfSize(2)
      expect(await node.attached()).toBeArrayOfSize(2)
      const foundArchivist = await NodeWrapper.wrap(node).resolve(archivist.address)
      expect(foundArchivist).toBeDefined()
      expect(foundArchivist?.address).toBe(archivist.address)
      const testPayload = new XyoPayloadBuilder<XyoPayload<{ schema: XyoPayloadSchema; test: boolean }>>({ schema: XyoPayloadSchema })
        .fields({ test: true })
        .build()

      const foundArchivistWrapper = foundArchivist ? new ArchivistWrapper(foundArchivist) : undefined
      await foundArchivistWrapper?.insert([testPayload])

      /*const subscribeQuery: AbstractModuleSubscribeQuery = { payloads: [testPayload], schema: AbstractModuleSubscribeQuerySchema }
  await foundArchivist?.query(subscribeQuery)*/

      const payloads = await foundArchivistWrapper?.all()
      expect(payloads?.length).toBe(1)

      if (payloads && payloads[0]) {
        const huri = new PayloadWrapper(payloads[0]).hash
        const huriPayload: XyoHuriPayload = { huri: [huri], schema: XyoHuriSchema }
        const module = (await NodeWrapper.wrap(node).resolve(diviner.address)) as DivinerModule | undefined
        const foundDiviner = module ? new DivinerWrapper(module) : null
        expect(foundDiviner).toBeDefined()
        if (foundDiviner) {
          const foundDivinerWrapper = new DivinerWrapper(foundDiviner)
          const payloads = await foundDivinerWrapper.divine([huriPayload])
          expect(payloads?.length).toBe(1)
          expect(payloads[0]).toBeDefined()
          if (payloads?.length === 1 && payloads[0]) {
            expect(new PayloadWrapper(payloads[0]).hash).toBe(huri)
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
      node.register(module)
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
        node.register(module)
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
      node.register(module)
    })
    it('attaches module', async () => {
      await node.attach(module.address, true)
    })
    it('emits event on module attach', async () => {
      let attachDone = false
      let eventDone = false
      return await new Promise<void>((resolve, reject) => {
        node.on('moduleAttached', (args) => {
          expect(args.module).toBeObject()
          expect(args.module.address).toBe(module.address)
          expect(args.module).toBe(module)
          eventDone = true
          if (attachDone) {
            resolve()
          }
        })
        node
          .attach(module.address, true)
          .then(() => {
            attachDone = true
            if (eventDone) {
              resolve()
            }
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
      node.register(module)
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
      node.register(module)
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
      it('returns registered modules', () => {
        node.register(module)
        const modules = node.registeredModules()
        expect(modules).toBeArrayOfSize(1)
        expect(modules).toContain(module)
      })
    })
  })
  describe('unregister', () => {
    it('un-registers module', async () => {
      const module = await MemoryArchivist.create()
      node.register(module)
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
        const wrapper = NodeWrapper.wrap(node)
        const description = await wrapper.describe()
        validateModuleDescription(description)
        expect(description.children).toBeArrayOfSize(0)
      })
      it('serializes to JSON consistently', async () => {
        const wrapper = NodeWrapper.wrap(node)
        const description = await wrapper.describe()
        expect(prettyPrintDescription(description)).toMatchSnapshot()
      })
    })
    describe('node with child modules', () => {
      beforeEach(async () => {
        const modules = await Promise.all([
          await MemoryArchivist.create({ account: testAccount2, config: archivistConfig }),
          await MemoryArchivist.create({ account: testAccount3, config: archivistConfig }),
        ])
        modules.map(async (mod) => {
          node.register(mod)
          await node.attach(mod.address, true)
        })
      })
      it('describes node and child modules', async () => {
        const wrapper = NodeWrapper.wrap(node)
        const description = await wrapper.describe()
        validateModuleDescription(description)
        expect(description.children).toBeArrayOfSize(2)
        //description.children?.map(validateModuleDescription)
      })
      it('serializes to JSON consistently', async () => {
        const wrapper = NodeWrapper.wrap(node)
        const description = await wrapper.describe()
        expect(prettyPrintDescription(description)).toMatchSnapshot()
      })
    })
    describe('node with nested nodes and modules', () => {
      beforeEach(async () => {
        const nestedNode = await MemoryNode.create({ account: testAccount2, config: nodeConfig })
        const nestedModules = await Promise.all([await MemoryArchivist.create({ account: testAccount3, config: archivistConfig })])
        nestedModules.map(async (mod) => {
          nestedNode.register(mod)
          await nestedNode.attach(mod.address, true)
        })
        const rootModules: AbstractModule[] = await Promise.all([await MemoryArchivist.create({ account: testAccount4, config: archivistConfig })])
        rootModules.push(nestedNode)
        rootModules.map(async (mod) => {
          node.register(mod)
          await node.attach(mod.address, true)
        })
      })
      it('describes node and all nested nodes and child modules', async () => {
        const memoryNode = await MemoryNode.create()
        const archivist1 = await MemoryArchivist.create()
        const archivist2 = await MemoryArchivist.create()
        const wrapper = NodeWrapper.wrap(memoryNode)
        await memoryNode.register(archivist1).attach(archivist1.address, true)
        await memoryNode.register(archivist2).attach(archivist2.address, true)
        const description = await wrapper.describe()
        validateModuleDescription(description)
        expect(description.children).toBeArrayOfSize(2)
        //description.children?.map(validateModuleDescription)
      })
      it('serializes to JSON consistently', async () => {
        const wrapper = NodeWrapper.wrap(node)
        const description = await wrapper.describe()
        expect(prettyPrintDescription(description)).toMatchSnapshot()
      })
    })
  })
  describe('discover', () => {
    const archivistConfig = { schema: MemoryArchivistConfigSchema }
    const validateDiscoveryResponse = (mod: Module, response: XyoPayload[]) => {
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
            memoryNode.register(mod)
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
        const nestedNode = await MemoryNode.create({ account: testAccount2, config: nodeConfig })
        const nestedModules = await Promise.all([await MemoryArchivist.create({ account: testAccount3, config: archivistConfig })])
        nestedModules.map(async (mod) => {
          nestedNode.register(mod)
          await nestedNode.attach(mod.address, true)
        })
        const rootModules: AbstractModule[] = await Promise.all([await MemoryArchivist.create({ account: testAccount4, config: archivistConfig })])
        rootModules.push(nestedNode)
        rootModules.map(async (mod) => {
          node.register(mod)
          await node.attach(mod.address, true)
        })
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
