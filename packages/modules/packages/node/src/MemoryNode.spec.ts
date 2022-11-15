/* eslint-disable max-statements */
import { XyoArchivistWrapper, XyoMemoryArchivist, XyoMemoryArchivistConfigSchema } from '@xyo-network/archivist'
import {
  DivinerModule,
  XyoArchivistPayloadDiviner,
  XyoArchivistPayloadDivinerConfigSchema,
  XyoDivinerWrapper,
  XyoHuriPayload,
  XyoHuriSchema,
} from '@xyo-network/diviner'
import { ModuleDescription, XyoModule, XyoModuleResolver } from '@xyo-network/module'
import { PayloadWrapper, XyoAccount, XyoPayload, XyoPayloadBuilder, XyoPayloadSchema } from '@xyo-network/sdk'

import { NodeConfigSchema } from './Config'
import { MemoryNode } from './MemoryNode'
import { NodeModule } from './NodeModule'

describe('MemoryNode', () => {
  describe('create', () => {
    it('Creates MemoryNode', async () => {
      const XyoMemoryArchivist = (await import('@xyo-network/archivist')).XyoMemoryArchivist
      const node: NodeModule = await MemoryNode.create()
      const archivist = await XyoMemoryArchivist.create()
      const diviner: XyoModule = await XyoArchivistPayloadDiviner.create({
        config: { archivist: archivist.address, schema: XyoArchivistPayloadDivinerConfigSchema },
        resolver: new XyoModuleResolver().add(archivist),
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

      const foundArchivistWrapper = foundArchivist ? new XyoArchivistWrapper(foundArchivist) : undefined
      await foundArchivistWrapper?.insert([testPayload])

      /*const subscribeQuery: XyoModuleSubscribeQuery = { payloads: [testPayload], schema: XyoModuleSubscribeQuerySchema }
  await foundArchivist?.query(subscribeQuery)*/

      const payloads = await foundArchivistWrapper?.all()
      expect(payloads?.length).toBe(1)

      if (payloads && payloads[0]) {
        const huri = new PayloadWrapper(payloads[0]).hash
        const huriPayload: XyoHuriPayload = { huri: [huri], schema: XyoHuriSchema }
        const module = (await node.resolve({ address: [diviner.address] })).shift() as DivinerModule
        const foundDiviner = module ? new XyoDivinerWrapper(module) : null
        expect(foundDiviner).toBeDefined()
        if (foundDiviner) {
          const foundDivinerWrapper = new XyoDivinerWrapper(foundDiviner)
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
      const node = await MemoryNode.create()
      const module = await XyoMemoryArchivist.create()
      node.register(module)
    })
  })
  describe('registered', () => {
    describe('with no modules registered', () => {
      it('returns empty array', async () => {
        const node = await MemoryNode.create()
        const result = node.registered()
        expect(result).toBeArrayOfSize(0)
      })
    })
    describe('with modules registered', () => {
      it('lists addresses of registered modules', async () => {
        const node = await MemoryNode.create()
        const module = await XyoMemoryArchivist.create()
        node.register(module)
        const result = node.registered()
        expect(result).toBeArrayOfSize(1)
        expect(result).toEqual([module.address])
      })
    })
  })
  describe('attach', () => {
    it('attaches module', async () => {
      const node = await MemoryNode.create()
      const module = await XyoMemoryArchivist.create()
      node.register(module)
      node.attach(module.address)
    })
  })
  describe('attached', () => {
    describe('with no modules attached', () => {
      it('returns empty array', async () => {
        const node = await MemoryNode.create()
        const module = await XyoMemoryArchivist.create()
        node.register(module)
        const result = await node.attached()
        expect(result).toBeArrayOfSize(0)
      })
    })
    describe('with modules attached', () => {
      it('lists addresses of attached modules', async () => {
        const node = await MemoryNode.create()
        const module = await XyoMemoryArchivist.create()
        node.register(module)
        node.attach(module.address)
        const result = node.registered()
        expect(result).toBeArrayOfSize(1)
        expect(result).toEqual([module.address])
      })
    })
  })
  describe('detach', () => {
    // TODO:
  })
  describe('detached', () => {
    // TODO:
  })
  describe('description', () => {
    const testAccount1 = new XyoAccount({ phrase: 'testPhrase1' })
    const testAccount2 = new XyoAccount({ phrase: 'testPhrase2' })
    const testAccount3 = new XyoAccount({ phrase: 'testPhrase3' })
    const testAccount4 = new XyoAccount({ phrase: 'testPhrase4' })
    const nodeConfig = { schema: NodeConfigSchema }
    const archivistConfig = { schema: XyoMemoryArchivistConfigSchema }
    let rootNode: MemoryNode
    const validateModuleDescription = (description: ModuleDescription) => {
      expect(description).toBeObject()
      expect(description.address).toBeString()
      expect(description.queries).toBeArray()
      description.queries.map((query) => {
        expect(query).toBeString()
      })
    }
    describe('node without children', () => {
      beforeAll(async () => {
        rootNode = await MemoryNode.create({ account: testAccount1, config: nodeConfig })
      })
      it('describes node alone', async () => {
        const description = await rootNode.description()
        validateModuleDescription(description)
        expect(description.children).toBeArrayOfSize(0)
      })
      it('serializes to JSON consistently', async () => {
        const description = await rootNode.description()
        expect(prettyPrintDescription(description)).toMatchSnapshot()
      })
    })
    describe('node with children', () => {
      beforeAll(async () => {
        rootNode = await MemoryNode.create({ account: testAccount1, config: nodeConfig })
        const modules = await Promise.all([
          await XyoMemoryArchivist.create({ account: testAccount2, config: archivistConfig }),
          await XyoMemoryArchivist.create({ account: testAccount3, config: archivistConfig }),
        ])
        modules.map((mod) => {
          rootNode.register(mod)
          rootNode.attach(mod.address)
        })
      })
      it('describes node and children', async () => {
        const description = await rootNode.description()
        validateModuleDescription(description)
        expect(description.children).toBeArrayOfSize(2)
        description.children?.map(validateModuleDescription)
      })
      it('serializes to JSON consistently', async () => {
        const description = await rootNode.description()
        expect(prettyPrintDescription(description)).toMatchSnapshot()
      })
    })
    describe('node with nested node and children', () => {
      beforeAll(async () => {
        rootNode = await MemoryNode.create({ account: testAccount1, config: nodeConfig })
        const nestedNode = await MemoryNode.create({ account: testAccount2, config: nodeConfig })
        const nestedModules = await Promise.all([await XyoMemoryArchivist.create({ account: testAccount3, config: archivistConfig })])
        nestedModules.map((mod) => {
          nestedNode.register(mod)
          nestedNode.attach(mod.address)
        })
        const rootModules: XyoModule[] = await Promise.all([await XyoMemoryArchivist.create({ account: testAccount4, config: archivistConfig })])
        rootModules.push(nestedNode)
        rootModules.map((mod) => {
          rootNode.register(mod)
          rootNode.attach(mod.address)
        })
      })
      it('describes all nested nodes and children', async () => {
        const description = await rootNode.description()
        validateModuleDescription(description)
        expect(description.children).toBeArrayOfSize(2)
        description.children?.map(validateModuleDescription)
      })
      it('serializes to JSON consistently', async () => {
        const description = await rootNode.description()
        expect(prettyPrintDescription(description)).toMatchSnapshot()
      })
    })
  })
})

const prettyPrintDescription = (description: ModuleDescription) => {
  return JSON.stringify(description, null, 2)
}
