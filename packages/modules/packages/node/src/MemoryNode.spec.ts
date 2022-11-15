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
  describe('description', () => {
    const testNodeAccount = new XyoAccount({ phrase: 'testPhrase1' })
    let node: MemoryNode
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
        node = await MemoryNode.create({ account: testNodeAccount, config: { schema: NodeConfigSchema } })
      })
      it('describes node alone', async () => {
        const description = await node.description()
        validateModuleDescription(description)
        expect(description.children).toBeArrayOfSize(0)
      })
      it('serializes to JSON consistently', async () => {
        const description = await node.description()
        expect(JSON.stringify(description)).toMatchSnapshot()
      })
    })
    describe('node with children', () => {
      const testArchivistAccount1 = new XyoAccount({ phrase: 'testPhrase2' })
      const testArchivistAccount2 = new XyoAccount({ phrase: 'testPhrase3' })
      let modules: XyoModule[]
      beforeAll(async () => {
        node = await MemoryNode.create({ account: testNodeAccount, config: { schema: NodeConfigSchema } })
        const config = { schema: XyoMemoryArchivistConfigSchema }
        modules = await Promise.all([
          await XyoMemoryArchivist.create({ account: testArchivistAccount1, config }),
          await XyoMemoryArchivist.create({ account: testArchivistAccount2, config }),
        ])
        modules.map((archivist) => {
          node.register(archivist)
          node.attach(archivist.address)
        })
      })
      it('describes node and children', async () => {
        const description = await node.description()
        validateModuleDescription(description)
        expect(description.children).toBeArrayOfSize(modules.length)
        description.children?.map(validateModuleDescription)
      })
      it('serializes to JSON consistently', async () => {
        const description = await node.description()
        expect(JSON.stringify(description)).toMatchSnapshot()
      })
    })
  })
})
