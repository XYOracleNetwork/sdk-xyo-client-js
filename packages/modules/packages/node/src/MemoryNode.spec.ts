/* eslint-disable max-statements */
import { XyoArchivistAllQuery, XyoArchivistAllQuerySchema, XyoArchivistInsertQuery, XyoArchivistInsertQuerySchema } from '@xyo-network/archivist'
import {
  DivinerModule,
  XyoArchivistPayloadDiviner,
  XyoDivinerDivineQuery,
  XyoDivinerDivineQuerySchema,
  XyoDivinerWrapper,
  XyoHuriPayload,
  XyoHuriSchema,
} from '@xyo-network/diviner'
import { XyoModule } from '@xyo-network/module'
import { BoundWitnessBuilder, PayloadWrapper, XyoAccount, XyoPayload, XyoPayloadBuilder, XyoPayloadSchema } from '@xyo-network/sdk'

import { MemoryNode } from './MemoryNode'
import { NodeModule } from './NodeModule'

test('Create Node', async () => {
  const XyoMemoryArchivist = (await import('@xyo-network/archivist')).XyoMemoryArchivist
  const node: NodeModule = new MemoryNode()
  const archivist = new XyoMemoryArchivist()
  const diviner: XyoModule = new XyoArchivistPayloadDiviner({}, archivist)
  await node.register(archivist)
  node.attach(archivist.address)
  await node.register(diviner)
  node.attach(diviner.address)
  expect((await node.registered()).length).toBe(2)
  expect((await node.attached()).length).toBe(2)
  const foundArchivist = await node.resolve(archivist.address)
  expect(foundArchivist).toBeDefined()
  expect(foundArchivist?.address).toBe(archivist.address)
  const testPayload = new XyoPayloadBuilder<XyoPayload<{ schema: XyoPayloadSchema; test: boolean }>>({ schema: XyoPayloadSchema })
    .fields({ test: true })
    .build()

  const insertQuery: XyoArchivistInsertQuery = { payloads: [testPayload], schema: XyoArchivistInsertQuerySchema }
  const insertQueryBoundwitness = new BoundWitnessBuilder().payload(insertQuery).witness(new XyoAccount()).build()
  await foundArchivist?.query(insertQueryBoundwitness, insertQuery)

  /*const subscribeQuery: XyoModuleSubscribeQuery = { payloads: [testPayload], schema: XyoModuleSubscribeQuerySchema }
  await foundArchivist?.query(subscribeQuery)*/

  const allQuery: XyoArchivistAllQuery = { schema: XyoArchivistAllQuerySchema }
  const allQueryBoundwitness = new BoundWitnessBuilder().payload(allQuery).witness(new XyoAccount()).build()
  const [, payloads] = (await foundArchivist?.query(allQueryBoundwitness, allQuery)) ?? []
  expect(payloads?.length).toBe(1)

  if (payloads && payloads[0]) {
    const huri = new PayloadWrapper(payloads[0]).hash
    const huriPayload: XyoHuriPayload = { huri, schema: XyoHuriSchema }
    const divineQuery: XyoDivinerDivineQuery = { payloads: [huriPayload], schema: XyoDivinerDivineQuerySchema }
    const divineQueryBoundwitness = new BoundWitnessBuilder().payload(divineQuery).witness(new XyoAccount()).build()
    const divinerModule = node.resolve(diviner.address) as DivinerModule
    const foundDiviner = divinerModule ? new XyoDivinerWrapper(divinerModule) : null
    expect(foundDiviner).toBeDefined()
    if (foundDiviner) {
      const [, payloads] = await foundDiviner.query(divineQueryBoundwitness, divineQuery)
      expect(payloads?.length).toBe(1)
      expect(payloads[0]).toBeDefined()
      if (payloads?.length === 1 && payloads[0]) {
        expect(new PayloadWrapper(payloads[0]).hash).toBe(huri)
      }
    }
  }
})
