/* eslint-disable max-statements */
import '@xylabs/vitest-extended'

import { MemoryArchivist, MemoryArchivistConfigSchema } from '@xyo-network/archivist-memory'
import { asArchivistInstance } from '@xyo-network/archivist-model'
import { ArchivistPayloadDiviner, ArchivistPayloadDivinerConfigSchema } from '@xyo-network/diviner-archivist'
import type { HuriPayload } from '@xyo-network/diviner-huri'
import { HuriSchema } from '@xyo-network/diviner-huri'
import { asDivinerInstance } from '@xyo-network/diviner-model'
import type { Payload } from '@xyo-network/payload'
import { PayloadBuilder, PayloadSchema } from '@xyo-network/payload'
import {
  describe, expect,
  it,
} from 'vitest'

// eslint-disable-next-line no-restricted-imports
import { MemoryNode } from '../../index.ts'

/**
 * @group node
 * @group module
 */

describe('MemoryNode', () => {
  it('WithArchivistAndDiviner', async () => {
    const node = await MemoryNode.create({ account: 'random' })
    const archivist = await MemoryArchivist.create({
      account: 'random',
      config: { name: 'Archivist', schema: MemoryArchivistConfigSchema },
    })

    await node.register(archivist)
    await node.attach(archivist.address, true)

    const privateArchivist = await MemoryArchivist.create({
      account: 'random',
      config: { name: 'PrivateArchivist', schema: MemoryArchivistConfigSchema },
    })

    await node.register(privateArchivist)
    await node.attach(privateArchivist.address, false)

    const diviner = await ArchivistPayloadDiviner.create({
      account: 'random',
      config: { archivist: archivist.address, schema: ArchivistPayloadDivinerConfigSchema },
    })

    await node.register(diviner)
    await node.attach(diviner.address, true)

    expect(await node.registered()).toBeArrayOfSize(3)
    expect(await node.attached()).toBeArrayOfSize(3)

    const foundArchivist = asArchivistInstance(await node.resolve(archivist.address))
    expect(foundArchivist).toBeDefined()
    const foundNamedArchivist = asArchivistInstance(await node.resolve('Archivist'))
    expect(foundNamedArchivist).toBeDefined()
    expect(foundArchivist?.address).toBe(archivist.address)
    const testPayload = new PayloadBuilder<Payload<{ schema: PayloadSchema; test: boolean }>>({ schema: PayloadSchema })
      .fields({ test: true })
      .build()

    await foundArchivist?.insert([testPayload])

    const payloads = await foundArchivist?.all?.()
    expect(payloads?.length).toBe(1)

    if (payloads && payloads[0]) {
      const huri = await PayloadBuilder.dataHash(payloads[0])
      const huriPayload: HuriPayload = { huri: [huri], schema: HuriSchema }
      const mod = await node.resolve(diviner.address)
      const foundDiviner = asDivinerInstance(mod)
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

    expect((await node.resolve('*', { direction: 'up' })).length).toBe(1)
    expect((await node.resolve('*', { direction: 'up', maxDepth: 0 })).length).toBe(1)
    expect((await node.resolve('*', { direction: 'up', maxDepth: 1 })).length).toBe(1)

    const nodeDown = await node.resolve('*', { direction: 'down' })
    expect(nodeDown.length).toBe(3)
    expect(nodeDown.find(mod => mod.address === node.address)).toBeDefined()
    expect(nodeDown.find(mod => mod.address === archivist.address)).toBeDefined()
    expect(nodeDown.find(mod => mod.address === diviner.address)).toBeDefined()

    expect((await node.resolvePrivate('*', { direction: 'down' })).length).toBe(1)
    expect((await node.resolve('*', { direction: 'down', maxDepth: 0 })).length).toBe(1)
    expect((await node.resolve('*', { direction: 'down', maxDepth: 1 })).length).toBe(3)

    // this should be 3 here and not 4 since node is at the top and asking it to resolve its privates
    // from outside should not include the private cousin
    expect((await node.resolve('*', { direction: 'all' })).length).toBe(3)

    const archivistUp = await archivist.resolve('*', { direction: 'up' })

    expect(archivistUp.find(mod => mod.address === node.address)).toBeDefined()
    expect(archivistUp.find(mod => mod.address === archivist.address)).toBeDefined()
    expect(archivistUp.find(mod => mod.address === diviner.address)).toBeDefined()
    // this is 4 here since it will include the one private cousin
    expect(archivistUp.length).toBe(4)

    expect((await archivist.resolve('*', { direction: 'up', maxDepth: 1 })).length).toBe(2)
    expect((await archivist.resolve('*', { direction: 'down' })).length).toBe(1)

    // this is 4 here since it will include the one private cousin
    expect((await archivist.resolve('*', { direction: 'all' })).length).toBe(4)
  })
})
