import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { MemoryNode } from '@xyo-network/node-memory'
import { PayloadSchema } from '@xyo-network/payload-model'
import type { ReportEndEventArgs, SentinelConfig } from '@xyo-network/sentinel-model'
import { SentinelConfigSchema } from '@xyo-network/sentinel-model'
import { AdhocWitness, AdhocWitnessConfigSchema } from '@xyo-network/witness-adhoc'

import type { MemorySentinelParams } from '../MemorySentinel'
import { MemorySentinel } from '../MemorySentinel'

/**
 * @group sentinel
 * @group module
 */

describe('Sentinel', () => {
  test('report [resolve]', async () => {
    const paramsA = {
      config: {
        payload: { nonce: Math.floor(Math.random() * 9_999_999), schema: 'network.xyo.test' },
        schema: AdhocWitnessConfigSchema,
        targetSchema: PayloadSchema,
      },
    }
    const paramsB = {
      config: {
        payload: { nonce: Math.floor(Math.random() * 9_999_999), schema: 'network.xyo.test' },
        schema: AdhocWitnessConfigSchema,
        targetSchema: PayloadSchema,
      },
    }
    const witnessA = (await AdhocWitness.create({ ...paramsA, account: 'random' })) as AdhocWitness
    const witnessB = (await AdhocWitness.create({ ...paramsB, account: 'random' })) as AdhocWitness
    const archivistA = await MemoryArchivist.create({ account: 'random' })
    const archivistB = await MemoryArchivist.create({ account: 'random' })

    const node = await MemoryNode.create({ account: 'random' })
    await Promise.all(
      [witnessA, witnessB, archivistA, archivistB].map(async (mod) => {
        await node.register(mod)
        await node.attach(mod.address)
      }),
    )
    const params: MemorySentinelParams<SentinelConfig> = {
      account: 'random',
      config: {
        archiving: { archivists: [archivistA.address, archivistB.address] },
        schema: SentinelConfigSchema,
        synchronous: true,
        tasks: [{ mod: witnessA.address }, { mod: witnessB.address }],
      },
    }
    const sentinel = await MemorySentinel.create(params)
    sentinel.on('reportEnd', (args) => {
      const { outPayloads } = args as ReportEndEventArgs
      expect(outPayloads?.length).toBe(2)
    })
    await node.register(sentinel)
    await node.attach(sentinel.address)
    const result = await sentinel.report()
    expect(result?.length).toBe(3)
  })
})
