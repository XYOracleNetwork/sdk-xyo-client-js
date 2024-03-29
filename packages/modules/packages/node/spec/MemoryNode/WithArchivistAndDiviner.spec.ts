/* eslint-disable max-statements */
import { Account } from '@xyo-network/account'
import { MemoryArchivist, MemoryArchivistConfigSchema } from '@xyo-network/archivist-memory'
import { asArchivistInstance } from '@xyo-network/archivist-model'
import { ArchivistPayloadDiviner, ArchivistPayloadDivinerConfigSchema } from '@xyo-network/diviner-archivist'
import { HuriPayload, HuriSchema } from '@xyo-network/diviner-huri'
import { asDivinerInstance } from '@xyo-network/diviner-model'
import { Payload, PayloadBuilder, PayloadSchema } from '@xyo-network/payload'

import { MemoryNode } from '../../src'

/**
 * @group node
 * @group module
 */

describe('MemoryNode', () => {
  it('WithArchivistAndDiviner', async () => {
    const node = await MemoryNode.create({ account: Account.randomSync() })
    const archivist = await MemoryArchivist.create({
      account: Account.randomSync(),
      config: { name: 'Archivist', schema: MemoryArchivistConfigSchema },
    })

    await node.register(archivist)
    await node.attach(archivist.address, true)

    const privateArchivist = await MemoryArchivist.create({
      account: Account.randomSync(),
      config: { name: 'PrivateArchivist', schema: MemoryArchivistConfigSchema },
    })

    await node.register(privateArchivist)
    await node.attach(privateArchivist.address, false)

    const diviner = await ArchivistPayloadDiviner.create({
      account: Account.randomSync(),
      config: { archivist: archivist.address, schema: ArchivistPayloadDivinerConfigSchema },
    })

    await node.register(diviner)
    await node.attach(diviner.address, true)

    expect(node.registered()).toBeArrayOfSize(3)
    expect(await node.attached()).toBeArrayOfSize(3)

    const foundArchivist = asArchivistInstance(await node.resolve(archivist.address))
    expect(foundArchivist).toBeDefined()
    const foundNamedArchivist = asArchivistInstance(await node.resolve('Archivist'))
    expect(foundNamedArchivist).toBeDefined()
    expect(foundArchivist?.address).toBe(archivist.address)
    const testPayload = await new PayloadBuilder<Payload<{ schema: PayloadSchema; test: boolean }>>({ schema: PayloadSchema })
      .fields({ test: true })
      .build()

    await foundArchivist?.insert([testPayload])

    const payloads = await foundArchivist?.all?.()
    expect(payloads?.length).toBe(1)

    if (payloads && payloads[0]) {
      const huri = await PayloadBuilder.dataHash(payloads[0])
      const huriPayload: HuriPayload = { huri: [huri], schema: HuriSchema }
      const module = await node.resolve(diviner.address)
      const foundDiviner = asDivinerInstance(module)
      expect(foundDiviner).toBeDefined()
      if (foundDiviner) {
        const payloads = await foundDiviner.divine([huriPayload])
        expect(payloads?.length).toBe(1)
        expect(payloads[0]).toBeDefined()
        if (payloads?.length === 1 && payloads[0]) {
          expect(await PayloadBuilder.dataHash(payloads[0])).toBe(huri)
        }
      }
    }

    expect((await node.resolve('*', { direction: 'up' })).length).toBe(0)
    expect((await node.resolve('*', { direction: 'up', maxDepth: 0 })).length).toBe(0)
    expect((await node.resolve('*', { direction: 'up', maxDepth: 1 })).length).toBe(0)
    expect((await node.resolve('*', { direction: 'down' })).length).toBe(2)
    expect((await node.resolve('*', { direction: 'down', visibility: 'all' })).length).toBe(3)
    expect((await node.resolve('*', { direction: 'down', visibility: 'private' })).length).toBe(1)
    expect((await node.resolve('*', { direction: 'down', visibility: 'public' })).length).toBe(2)
    expect((await node.resolve('*', { direction: 'down', maxDepth: 0 })).length).toBe(0)
    expect((await node.resolve('*', { direction: 'down', maxDepth: 1 })).length).toBe(2)
    expect((await node.resolve('*', { direction: 'all' })).length).toBe(3)

    expect((await archivist.resolve('*', { direction: 'up' })).length).toBe(3)
    expect((await archivist.resolve('*', { direction: 'up', maxDepth: 1 })).length).toBe(1)
    expect((await archivist.resolve('*', { direction: 'down' })).length).toBe(0)
    expect((await archivist.resolve('*', { direction: 'all' })).length).toBe(3)
  })
})
