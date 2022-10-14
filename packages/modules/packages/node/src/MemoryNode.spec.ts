/* eslint-disable max-statements */
import { XyoArchivistWrapper } from '@xyo-network/archivist'
import {
  DivinerModule,
  XyoArchivistPayloadDiviner,
  XyoArchivistPayloadDivinerConfigSchema,
  XyoDivinerWrapper,
  XyoHuriPayload,
  XyoHuriSchema,
} from '@xyo-network/diviner'
import { XyoModule, XyoModuleResolver } from '@xyo-network/module'
import { PayloadWrapper, XyoPayload, XyoPayloadBuilder, XyoPayloadSchema } from '@xyo-network/sdk'

import { MemoryNode } from './MemoryNode'
import { NodeModule } from './NodeModule'

test('Create Node', async () => {
  const XyoMemoryArchivist = (await import('@xyo-network/archivist')).XyoMemoryArchivist
  const node: NodeModule = new MemoryNode()
  const archivist = new XyoMemoryArchivist()
  await archivist.start()
  const diviner: XyoModule = new XyoArchivistPayloadDiviner({
    config: { archivist: archivist.address, schema: XyoArchivistPayloadDivinerConfigSchema },
    resolver: new XyoModuleResolver().add(archivist),
  })
  await diviner.start()
  await node.register(archivist)
  node.attach(archivist.address)
  await node.register(diviner)
  node.attach(diviner.address)
  expect((await node.registered()).length).toBe(2)
  expect((await node.attached()).length).toBe(2)
  const foundArchivist = (await node.resolve([archivist.address])).shift()
  expect(foundArchivist).toBeDefined()
  expect(foundArchivist?.address).toBe(archivist.address)
  const testPayload = new XyoPayloadBuilder<XyoPayload<{ schema: XyoPayloadSchema; test: boolean }>>({ schema: XyoPayloadSchema })
    .fields({ test: true })
    .build()

  const foundArchivistWrapper = foundArchivist ? new XyoArchivistWrapper({ module: foundArchivist }) : undefined
  await foundArchivistWrapper?.insert([testPayload])

  /*const subscribeQuery: XyoModuleSubscribeQuery = { payloads: [testPayload], schema: XyoModuleSubscribeQuerySchema }
  await foundArchivist?.query(subscribeQuery)*/

  const payloads = await foundArchivistWrapper?.all()
  expect(payloads?.length).toBe(1)

  if (payloads && payloads[0]) {
    const huri = new PayloadWrapper(payloads[0]).hash
    const huriPayload: XyoHuriPayload = { huri: [huri], schema: XyoHuriSchema }
    const module = (await node.resolve([diviner.address])).shift() as DivinerModule
    const foundDiviner = module ? new XyoDivinerWrapper({ module }) : null
    expect(foundDiviner).toBeDefined()
    if (foundDiviner) {
      const foundDivinerWrapper = new XyoDivinerWrapper({ module: foundDiviner })
      const payloads = await foundDivinerWrapper.divine([huriPayload])
      console.log(`payloads: ${JSON.stringify(payloads, null, 2)}`)
      expect(payloads?.length).toBe(1)
      expect(payloads[0]).toBeDefined()
      if (payloads?.length === 1 && payloads[0]) {
        expect(new PayloadWrapper(payloads[0]).hash).toBe(huri)
      }
    }
  }
})
