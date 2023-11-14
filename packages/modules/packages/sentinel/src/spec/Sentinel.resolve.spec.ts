/* eslint-disable import/no-deprecated */

import { Account } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/archivist'
import { MemoryNode } from '@xyo-network/node-memory'
import { PayloadSchema } from '@xyo-network/payload-model'
import { ReportEndEventArgs, SentinelConfig, SentinelConfigSchema } from '@xyo-network/sentinel-model'
import { AdhocWitness, AdhocWitnessConfigSchema } from '@xyo-network/witnesses'

import { MemorySentinel, MemorySentinelParams } from '../MemorySentinel'

/**
 * @group sentinel
 */

describe('Sentinel', () => {
  test('report [resolve]', async () => {
    const paramsA = {
      account: Account.randomSync(),
      config: {
        payload: { nonce: Math.floor(Math.random() * 9999999), schema: 'network.xyo.test' },
        schema: AdhocWitnessConfigSchema,
        targetSchema: PayloadSchema,
      },
    }
    const paramsB = {
      account: Account.randomSync(),
      config: {
        payload: { nonce: Math.floor(Math.random() * 9999999), schema: 'network.xyo.test' },
        schema: AdhocWitnessConfigSchema,
        targetSchema: PayloadSchema,
      },
    }
    const witnessA = (await AdhocWitness.create(paramsA)) as AdhocWitness
    const witnessB = (await AdhocWitness.create(paramsB)) as AdhocWitness
    const archivistA = await MemoryArchivist.create({ account: Account.randomSync() })
    const archivistB = await MemoryArchivist.create({ account: Account.randomSync() })

    const node = await MemoryNode.create({ account: Account.randomSync() })
    await Promise.all(
      [witnessA, witnessB, archivistA, archivistB].map(async (module) => {
        await node.register(module)
        await node.attach(module.address)
      }),
    )
    const params: MemorySentinelParams<SentinelConfig> = {
      account: Account.randomSync(),
      config: {
        archiving: {
          archivists: [archivistA.address, archivistB.address],
        },
        schema: SentinelConfigSchema,
        synchronous: true,
        tasks: [{ module: witnessA.address }, { module: witnessB.address }],
      },
    }
    const sentinel = await MemorySentinel.create(params)
    sentinel.on('reportEnd', (args) => {
      const { outPayloads } = args as ReportEndEventArgs
      console.log('reportEnd')
      expect(outPayloads?.length).toBe(2)
    })
    await node.register(sentinel)
    await node.attach(sentinel.address)
    const result = await sentinel.report()
    result.forEach((payload) => console.log(`Result: ${payload.schema}`))
    expect(result?.length).toBe(3)
  })
})
