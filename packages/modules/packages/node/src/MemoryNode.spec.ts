/* eslint-disable max-statements */
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { ArchivistWrapper, MemoryArchivist, MemoryArchivistConfigSchema } from '@xyo-network/archivist'
import {
  ArchivistPayloadDiviner,
  DivinerModule,
  DivinerWrapper,
  XyoArchivistPayloadDivinerConfigSchema,
  XyoHuriPayload,
  XyoHuriSchema,
} from '@xyo-network/diviner'
import { AbstractModule, Module, ModuleDescription, SimpleModuleResolver } from '@xyo-network/module'
import { Account, PayloadWrapper, XyoPayload, XyoPayloadBuilder, XyoPayloadSchema } from '@xyo-network/protocol'

import { NodeConfigSchema } from './Config'
import { MemoryNode } from './MemoryNode'
import { NodeModule } from './NodeModule'

describe('MemoryNode', () => {
  const testAccount1 = new Account({ phrase: 'testPhrase1' })
  const testAccount2 = new Account({ phrase: 'testPhrase2' })
  const testAccount3 = new Account({ phrase: 'testPhrase3' })
  const testAccount4 = new Account({ phrase: 'testPhrase4' })
  const nodeConfig = { schema: NodeConfigSchema }
  let node: MemoryNode
  beforeEach(async () => {
    node = await MemoryNode.create({ account: testAccount1, config: nodeConfig })
  })
  describe('create', () => {
    it('Creates MemoryNode', async () => {
      const XyoMemoryArchivist = (await import('@xyo-network/archivist')).MemoryArchivist
      const node: NodeModule = await MemoryNode.create()
      const archivist = await XyoMemoryArchivist.create()
      const diviner: AbstractModule = await ArchivistPayloadDiviner.create({
        config: { archivist: archivist.address, schema: XyoArchivistPayloadDivinerConfigSchema },
        resolver: new SimpleModuleResolver().add(archivist),
      })
      await node.register(archivist)
      node.attach(archivist.address)
      await node.register(diviner)
      node.attach(diviner.address)
      expect((await node.registered()).length).toBe(2)
      expect((await node.attached()).length).toBe(2)
      const foundArchivist = (await node.resolve({ address: [archivist.address] })).shift()
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
        const module = (await node.resolve({ address: [diviner.address] })).shift() as DivinerModule
        const foundDiviner = module ? new DivinerWrapper(module) : null
        expect(foundDiviner).toBeDefined()
        if (foundDiviner) {
          const foundDivinerWrapper = new DivinerWrapper(foundDiviner)
          const payloads = await foundDivinerWrapper.divine([huriPayload])
          // console.log(`payloads: ${JSON.stringify(payloads, null, 2)}`)
          expect(payloads?.length).toBe(1)
          expect(payloads[0]).toBeDefined()
          if (payloads?.length === 1 && payloads[0]) {
            expect(new PayloadWrapper(payloads[0]).hash).toBe(huri)
          }
        }
      }
    })
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
    it('attaches module', () => {
      node.attach(module.address)
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
      beforeEach(() => {
        node.attach(module.address)
      })
      it('lists addresses of attached modules', async () => {
        node.attach(module.address)
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
      node.attach(module.address)
    })
    it('deregisters existing module', () => {
      node.detach(module.address)
    })
    it('allows deregistering non-existent module', () => {
      node.detach('4a15a6c96665931b76c1d2a587ea1132dbfdc266')
    })
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
      node.unregister(module)
      expect(node.registeredModules()).not.toContain(module)
    })
  })
  describe('description', () => {
    const archivistConfig = { schema: MemoryArchivistConfigSchema }
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
        const description = await node.description()
        validateModuleDescription(description)
        expect(description.children).toBeArrayOfSize(0)
      })
      it('serializes to JSON consistently', async () => {
        const description = await node.description()
        expect(prettyPrintDescription(description)).toMatchSnapshot()
      })
    })
    describe('node with child modules', () => {
      beforeEach(async () => {
        const modules = await Promise.all([
          await MemoryArchivist.create({ account: testAccount2, config: archivistConfig }),
          await MemoryArchivist.create({ account: testAccount3, config: archivistConfig }),
        ])
        modules.map((mod) => {
          node.register(mod)
          node.attach(mod.address)
        })
      })
      it('describes node and child modules', async () => {
        const description = await node.description()
        validateModuleDescription(description)
        expect(description.children).toBeArrayOfSize(2)
        description.children?.map(validateModuleDescription)
      })
      it('serializes to JSON consistently', async () => {
        const description = await node.description()
        expect(prettyPrintDescription(description)).toMatchSnapshot()
      })
    })
    describe('node with nested nodes and modules', () => {
      beforeEach(async () => {
        const nestedNode = await MemoryNode.create({ account: testAccount2, config: nodeConfig })
        const nestedModules = await Promise.all([await MemoryArchivist.create({ account: testAccount3, config: archivistConfig })])
        nestedModules.map((mod) => {
          nestedNode.register(mod)
          nestedNode.attach(mod.address)
        })
        const rootModules: AbstractModule[] = await Promise.all([await MemoryArchivist.create({ account: testAccount4, config: archivistConfig })])
        rootModules.push(nestedNode)
        rootModules.map((mod) => {
          node.register(mod)
          node.attach(mod.address)
        })
      })
      it('describes node and all nested nodes and child modules', async () => {
        const description = await node.description()
        validateModuleDescription(description)
        expect(description.children).toBeArrayOfSize(2)
        description.children?.map(validateModuleDescription)
      })
      it('serializes to JSON consistently', async () => {
        const description = await node.description()
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
      const queries = response.filter((p) => mod.queries().includes(p.schema))
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
      beforeEach(async () => {
        const modules = await Promise.all([
          await MemoryArchivist.create({ account: testAccount2, config: archivistConfig }),
          await MemoryArchivist.create({ account: testAccount3, config: archivistConfig }),
        ])
        modules.map((mod) => {
          node.register(mod)
          node.attach(mod.address)
        })
      })
      it('describes node and child modules', async () => {
        const description = await node.discover()
        validateDiscoveryResponse(node, description)
      })
    })
    describe('node with nested nodes and modules', () => {
      beforeEach(async () => {
        const nestedNode = await MemoryNode.create({ account: testAccount2, config: nodeConfig })
        const nestedModules = await Promise.all([await MemoryArchivist.create({ account: testAccount3, config: archivistConfig })])
        nestedModules.map((mod) => {
          nestedNode.register(mod)
          nestedNode.attach(mod.address)
        })
        const rootModules: AbstractModule[] = await Promise.all([await MemoryArchivist.create({ account: testAccount4, config: archivistConfig })])
        rootModules.push(nestedNode)
        rootModules.map((mod) => {
          node.register(mod)
          node.attach(mod.address)
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
