/**
 * @jest-environment jsdom
 */

import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { isArchivistInstance, isArchivistModule } from '@xyo-network/archivist-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import {
  describe, expect, it,
} from 'vitest'

import { ViewArchivist } from '../ViewArchivist.ts'

/**
 * @group module
 * @group archivist
 */
describe('MemoryArchivist', () => {
  it('should return same items inserted', async () => {
    const node = await MemoryNode.create({ account: 'random' })
    const originArchivist = await MemoryArchivist.create({
      account: 'random',
      config: { name: 'origin', schema: MemoryArchivist.defaultConfigSchema },
    })
    const viewArchivist = await ViewArchivist.create({
      account: 'random',
      config: {
        name: 'test', originArchivist: originArchivist.address, schema: ViewArchivist.defaultConfigSchema,
      },
    })

    expect(isArchivistInstance(viewArchivist)).toBeTruthy()
    expect(isArchivistModule(viewArchivist)).toBeTruthy()

    await node.register(originArchivist)
    await node.attach(originArchivist.modName ?? originArchivist.address, false)
    await node.register(viewArchivist)
    await node.attach(viewArchivist.modName ?? viewArchivist.address, true)

    const payloads = [{ schema: 'network.xyo.test' }]
    const payloadHashes = await Promise.all(payloads.map(async payload => await PayloadBuilder.dataHash(payload)))
    const result = await originArchivist.insert(payloads)

    expect(result.length).toEqual(payloads.length)
    expect(result[0].schema).toEqual(payloads[0].schema)

    const viewPayloads = await viewArchivist.get(payloadHashes)
    expect(viewPayloads.length).toEqual(payloads.length)
    expect(viewPayloads[0].schema).toEqual(payloads[0].schema)
  })
})
