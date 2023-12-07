import { AbstractWitness } from '@xyo-network/abstract-witness'
import { Account } from '@xyo-network/account'
import { Archivist, ArchivistInstance, MemoryArchivist } from '@xyo-network/archivist'
import { BoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { PayloadHasher } from '@xyo-network/hash'
import { IdWitness, IdWitnessConfigSchema } from '@xyo-network/id-plugin'
import { MemoryNode } from '@xyo-network/node-memory'
import { NodeSystemInfoWitness, NodeSystemInfoWitnessConfigSchema } from '@xyo-network/node-system-info-plugin'
import { Payload, PayloadSchema } from '@xyo-network/payload-model'
import { ReportEndEventArgs, SentinelConfig, SentinelConfigSchema } from '@xyo-network/sentinel-model'
import { AdhocWitness, AdhocWitnessConfigSchema } from '@xyo-network/witnesses'

import { MemorySentinel, MemorySentinelParams } from '../MemorySentinel'
import { SentinelWrapper } from '../Wrapper'

/**
 * @group sentinel
 * @group module
 */

describe('Sentinel', () => {
  test('all [simple sentinel report]', async () => {
    const node = await MemoryNode.create({ account: Account.randomSync() })
    const archivist = await MemoryArchivist.create({ account: Account.randomSync() })
    await node.register(archivist)
    await node.attach(archivist.address)

    const witnesses: AbstractWitness[] = [
      await IdWitness.create({ account: Account.randomSync(), config: { salt: 'test', schema: IdWitnessConfigSchema } }),
      await NodeSystemInfoWitness.create({
        account: Account.randomSync(),
        config: {
          nodeValues: {
            osInfo: '*',
          },
          schema: NodeSystemInfoWitnessConfigSchema,
        },
      }),
    ]

    await Promise.all(
      witnesses.map(async (witness) => {
        await node.register(witness)
        await node.attach(witness.address)
      }),
    )

    const config: SentinelConfig = {
      archiving: {
        archivists: [archivist.address],
      },
      schema: SentinelConfigSchema,
      synchronous: true,
      tasks: witnesses.map((witness) => ({ module: witness.address })),
    }

    const sentinel = (await MemorySentinel.create({ account: Account.randomSync(), config })) as MemorySentinel
    await node.register(sentinel)
    await node.attach(sentinel.address)

    const report1Result = await sentinel.report()
    const report1 = report1Result.at(0)
    expect(report1?.schema).toBe(BoundWitnessSchema)
  })
  describe('report', () => {
    describe('reports witnesses when supplied in', () => {
      let archivistA: ArchivistInstance
      let archivistB: ArchivistInstance
      let witnessA: AbstractWitness
      let witnessB: AbstractWitness
      const assertPanelReport = (panelReport: Payload[]) => {
        expect(panelReport).toBeArrayOfSize(3)
      }
      const assertArchivistStateMatchesPanelReport = async (payloads: Payload[], archivists: Archivist[]) => {
        for (const archivist of archivists) {
          const archivistPayloads = await archivist.all?.()
          expect(archivistPayloads).toBeArrayOfSize(payloads.length + 1)
          const panelPayloads = payloads.map((payload) => {
            return PayloadHasher.hashFields(payload)
          })
          expect(archivistPayloads).toContainValues(panelPayloads)
        }
      }
      beforeEach(async () => {
        const paramsA = {
          account: Account.randomSync(),
          config: {
            payload: { nonce: Date.now() * 8, schema: 'network.xyo.test' },
            schema: AdhocWitnessConfigSchema,
            targetSchema: PayloadSchema,
          },
        }
        const paramsB = {
          account: Account.randomSync(),
          config: {
            payload: { nonce: Date.now() * 9, schema: 'network.xyo.test' },
            schema: AdhocWitnessConfigSchema,
            targetSchema: PayloadSchema,
          },
        }
        witnessA = (await AdhocWitness.create(paramsA)) as AdhocWitness
        witnessB = (await AdhocWitness.create(paramsB)) as AdhocWitness
        archivistA = await MemoryArchivist.create({ account: Account.randomSync() })
        archivistB = await MemoryArchivist.create({ account: Account.randomSync() })
      })
      it('config', async () => {
        const node = await MemoryNode.create({ account: Account.randomSync() })
        await Promise.all(
          [witnessA, witnessB, archivistA, archivistB].map(async (module) => {
            await node.register(module)
            await node.attach(module.address, true)
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
          expect(outPayloads?.length).toBeGreaterThan(0)
        })
        await node.register(sentinel)
        await node.attach(sentinel.address)
        //using a wrapper to trigger archiving
        const wrapper = SentinelWrapper.wrap(sentinel, Account.randomSync())
        const result = await wrapper.report()
        assertPanelReport(result)
        await assertArchivistStateMatchesPanelReport(result, [archivistA, archivistB])
      })
    })
  })
})
