import {
  XyoArchivistAllQueryPayload,
  XyoArchivistAllQueryPayloadSchema,
  XyoArchivistInsertQueryPayload,
  XyoArchivistInsertQueryPayloadSchema,
  XyoMemoryArchivist,
} from '@xyo-network/archivist'
import {
  XyoArchivistPayloadDiviner,
  XyoDivinerDivineQueryPayload,
  XyoDivinerDivineQuerySchema,
  XyoHuriPayload,
  XyoHuriPayloadSchema,
} from '@xyo-network/diviner'
import { XyoModule } from '@xyo-network/module'
import { XyoAccount, XyoPayloadBuilder, XyoPayloadSchema, XyoPayloadWrapper } from '@xyo-network/sdk'

import { XyoSimpleNode } from './Simple'

test('Create Node', async () => {
  const node = new XyoSimpleNode()
  const archivistAccount = new XyoAccount()
  const archivist = new XyoMemoryArchivist({ account: archivistAccount })
  const divinerAccount = new XyoAccount()
  const diviner: XyoModule = new XyoArchivistPayloadDiviner({ account: divinerAccount, archivist })
  node.attach(archivist)
  node.attach(diviner)
  expect(node.list().length).toBe(2)
  const foundArchivist = node.get(archivistAccount.addressValue.hex)
  expect(foundArchivist).toBeDefined()
  expect(foundArchivist?.address).toBe(archivistAccount.addressValue.hex)
  const testPayload = new XyoPayloadBuilder({ schema: XyoPayloadSchema }).fields({ test: true }).build()

  const insertQuery: XyoArchivistInsertQueryPayload = { payloads: [testPayload], schema: XyoArchivistInsertQueryPayloadSchema }
  await foundArchivist?.query(insertQuery)

  /*const subscribeQuery: XyoModuleSubscribeQueryPayload = { payloads: [testPayload], schema: XyoModuleSubscribeQueryPayloadSchema }
  await foundArchivist?.query(subscribeQuery)*/

  const allQuery: XyoArchivistAllQueryPayload = { schema: XyoArchivistAllQueryPayloadSchema }
  const [, payloads] = (await foundArchivist?.query(allQuery)) ?? []
  expect(payloads?.length).toBe(1)

  if (payloads && payloads[0]) {
    const huri = new XyoPayloadWrapper(payloads[0]).hash
    const huriPayload: XyoHuriPayload = { huri, schema: XyoHuriPayloadSchema }
    const divineQuery: XyoDivinerDivineQueryPayload = { payloads: [huriPayload], schema: XyoDivinerDivineQuerySchema }
    const foundDiviner = node.get(divinerAccount.addressValue.hex)
    expect(foundDiviner).toBeDefined()
    if (foundDiviner) {
      const [, payloads] = await foundDiviner.query(divineQuery)
      expect(payloads?.length).toBe(1)
      expect(payloads[0]).toBeDefined()
      if (payloads?.length === 1 && payloads[0]) {
        expect(new XyoPayloadWrapper(payloads[0]).hash).toBe(huri)
      }
    }
  }
})
