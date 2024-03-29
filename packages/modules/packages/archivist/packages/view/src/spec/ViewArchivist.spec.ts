/**
 * @jest-environment jsdom
 */
import { Account } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { MemoryNode } from '@xyo-network/node-memory'
import { PayloadBuilder } from '@xyo-network/payload-builder'

import { ViewArchivist } from '../ViewArchivist'

/**
 * @group module
 * @group archivist
 */
describe('MemoryArchivist', () => {
  it('should return same items inserted', async () => {
    const node = await MemoryNode.create({ account: Account.randomSync(), config: { schema: MemoryNode.configSchema } })
    const originArchivist = await MemoryArchivist.create({
      account: Account.randomSync(),
      config: { name: 'origin', schema: MemoryArchivist.configSchema },
    })
    const viewArchivist = await ViewArchivist.create({
      account: Account.randomSync(),
      config: { name: 'test', originArchivist: originArchivist.address, schema: ViewArchivist.configSchema },
    })

    await node.register(originArchivist)
    await node.attach(originArchivist.config.name ?? originArchivist.address, false)
    await node.register(viewArchivist)
    await node.attach(viewArchivist.config.name ?? viewArchivist.address, true)

    const payloads = [await PayloadBuilder.build({ schema: 'network.xyo.test' })]
    const payloadHashes = payloads.map((payload) => payload.$hash)
    const result = await originArchivist.insert(payloads)

    expect(result.length).toEqual(payloads.length)
    expect(result[0].schema).toEqual(payloads[0].schema)

    const viewPayloads = await viewArchivist.get(payloadHashes)
    expect(viewPayloads.length).toEqual(payloads.length)
    expect(viewPayloads[0].schema).toEqual(payloads[0].schema)
  })
})
