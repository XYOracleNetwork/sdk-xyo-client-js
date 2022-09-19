import { XyoArchivistAllQuery, XyoArchivistAllQuerySchema, XyoArchivistInsertQuery, XyoArchivistInsertQuerySchema } from '@xyo-network/archivist'
import { XyoArchivistPayloadDiviner, XyoDivinerDivineQuery, XyoDivinerDivineQuerySchema, XyoHuriPayload, XyoHuriSchema } from '@xyo-network/diviner'
import { XyoModule } from '@xyo-network/module'
import { PayloadWrapper, XyoPayload, XyoPayloadBuilder, XyoPayloadSchema } from '@xyo-network/sdk'

import { MemoryNode } from './MemoryNode'

test('Create Node', async () => {
  const XyoMemoryArchivist = (await import('@xyo-network/archivist')).XyoMemoryArchivist
  const node = new MemoryNode()
  const archivist = new XyoMemoryArchivist()
  const diviner: XyoModule = new XyoArchivistPayloadDiviner({}, archivist)
  node.register(archivist)
  node.attach(archivist.address)
  node.register(diviner)
  node.attach(diviner.address)
  expect(node.registered().length).toBe(2)
  expect(node.attached().length).toBe(2)
  const foundArchivist = node.get(archivist.address)
  expect(foundArchivist).toBeDefined()
  expect(foundArchivist?.address).toBe(archivist.address)
  const testPayload = new XyoPayloadBuilder<XyoPayload<{ schema: XyoPayloadSchema; test: boolean }>>({ schema: XyoPayloadSchema })
    .fields({ test: true })
    .build()

  const insertQuery: XyoArchivistInsertQuery = { payloads: [testPayload], schema: XyoArchivistInsertQuerySchema }
  await foundArchivist?.query(insertQuery)

  /*const subscribeQuery: XyoModuleSubscribeQuery = { payloads: [testPayload], schema: XyoModuleSubscribeQuerySchema }
  await foundArchivist?.query(subscribeQuery)*/

  const allQuery: XyoArchivistAllQuery = { schema: XyoArchivistAllQuerySchema }
  const [, payloads] = (await foundArchivist?.query(allQuery)) ?? []
  expect(payloads?.length).toBe(1)

  if (payloads && payloads[0]) {
    const huri = new PayloadWrapper(payloads[0]).hash
    const huriPayload: XyoHuriPayload = { huri, schema: XyoHuriSchema }
    const divineQuery: XyoDivinerDivineQuery = { payloads: [huriPayload], schema: XyoDivinerDivineQuerySchema }
    const foundDiviner = node.get(diviner.address)
    expect(foundDiviner).toBeDefined()
    if (foundDiviner) {
      const [, payloads] = await foundDiviner.query(divineQuery)
      expect(payloads?.length).toBe(1)
      expect(payloads[0]).toBeDefined()
      if (payloads?.length === 1 && payloads[0]) {
        expect(new PayloadWrapper(payloads[0]).hash).toBe(huri)
      }
    }
  }
})
