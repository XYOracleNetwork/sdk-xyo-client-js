/* eslint-disable import/no-deprecated */

import { HDWallet } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/archivist'
import { MemoryNode } from '@xyo-network/node-memory'
import { PayloadSchema } from '@xyo-network/payload-model'
import { ReportEndEventArgs, SentinelConfig, SentinelConfigSchema } from '@xyo-network/sentinel-model'
import { AdhocWitness, AdhocWitnessConfigSchema } from '@xyo-network/witnesses'

import { MemorySentinel, MemorySentinelParams } from '../MemorySentinel'

describe('Sentinel', () => {
  test('report [resolve]', async () => {
    const paramsA = {
      account: await HDWallet.random(),
      config: {
        payload: { nonce: Math.floor(Math.random() * 9999999), schema: 'network.xyo.test' },
        schema: AdhocWitnessConfigSchema,
        targetSchema: PayloadSchema,
      },
    }
    const paramsB = {
      account: await HDWallet.random(),
      config: {
        payload: { nonce: Math.floor(Math.random() * 9999999), schema: 'network.xyo.test' },
        schema: AdhocWitnessConfigSchema,
        targetSchema: PayloadSchema,
      },
    }
    const witnessA = (await AdhocWitness.create(paramsA)) as AdhocWitness
    const witnessB = (await AdhocWitness.create(paramsB)) as AdhocWitness
    const archivistA = await MemoryArchivist.create({ account: await HDWallet.random() })
    const archivistB = await MemoryArchivist.create({ account: await HDWallet.random() })

    const node = await MemoryNode.create({ account: await HDWallet.random() })
    await Promise.all(
      [witnessA, witnessB, archivistA, archivistB].map(async (module) => {
        await node.register(module)
        await node.attach(module.address)
      }),
    )
    const params: MemorySentinelParams<SentinelConfig> = {
      account: await HDWallet.random(),
      config: {
        archivists: [archivistA.address, archivistB.address],
        schema: SentinelConfigSchema,
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
    const witnesses = await sentinel.witnesses()
    witnesses.forEach((witness) => console.log(`Witness: ${witness.address}`))
    expect(witnesses).toBeArrayOfSize(2)
    const result = await sentinel.report()
    result.forEach((payload) => console.log(`Result: ${payload.schema}`))
    expect(result?.length).toBe(3)
  })
})
