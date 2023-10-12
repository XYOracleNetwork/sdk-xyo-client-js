import { AbstractWitness } from '@xyo-network/abstract-witness'
import { HDWallet } from '@xyo-network/account'
import { Archivist, ArchivistInstance, MemoryArchivist } from '@xyo-network/archivist'
import { PayloadHasher } from '@xyo-network/core'
import { IdSchema } from '@xyo-network/id-payload-plugin'
import { IdWitness, IdWitnessConfigSchema } from '@xyo-network/id-plugin'
import { MemoryNode } from '@xyo-network/node-memory'
import { NodeSystemInfoWitness, NodeSystemInfoWitnessConfigSchema } from '@xyo-network/node-system-info-plugin'
import { Payload, PayloadSchema } from '@xyo-network/payload-model'
import { ReportEndEventArgs, SentinelConfig, SentinelConfigSchema } from '@xyo-network/sentinel-model'
import { AdhocWitness, AdhocWitnessConfigSchema } from '@xyo-network/witnesses'

import { SentinelWrapper } from '../../dist/node'
import { MemorySentinel, MemorySentinelParams } from '../MemorySentinel'

/**
 * @group sentinel
 */

describe('Sentinel', () => {
  test('all [simple sentinel report]', async () => {
    const node = await MemoryNode.create({ account: await HDWallet.random() })
    const archivist = await MemoryArchivist.create({ account: await HDWallet.random() })
    await node.register(archivist)
    await node.attach(archivist.address)

    const witnesses: AbstractWitness[] = [
      await IdWitness.create({ account: await HDWallet.random(), config: { salt: 'test', schema: IdWitnessConfigSchema } }),
      await NodeSystemInfoWitness.create({
        account: await HDWallet.random(),
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
      tasks: witnesses.map((witness) => ({ module: witness.address })),
    }

    const sentinel = (await MemorySentinel.create({ account: await HDWallet.random(), config })) as MemorySentinel
    await node.register(sentinel)
    await node.attach(sentinel.address)

    const report1Result = await sentinel.report()
    const report1 = report1Result[0]
    expect(report1.schema).toBe(IdSchema)
  })
  describe('report', () => {
    describe('reports witnesses when supplied in', () => {
      let archivistA: ArchivistInstance
      let archivistB: ArchivistInstance
      let witnessA: AbstractWitness
      let witnessB: AbstractWitness
      const assertPanelReport = (panelReport: Payload[]) => {
        expect(panelReport).toBeArrayOfSize(2)
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
          account: await HDWallet.random(),
          config: {
            payload: { nonce: Date.now() * 8, schema: 'network.xyo.test' },
            schema: AdhocWitnessConfigSchema,
            targetSchema: PayloadSchema,
          },
        }
        const paramsB = {
          account: await HDWallet.random(),
          config: {
            payload: { nonce: Date.now() * 9, schema: 'network.xyo.test' },
            schema: AdhocWitnessConfigSchema,
            targetSchema: PayloadSchema,
          },
        }
        witnessA = (await AdhocWitness.create(paramsA)) as AdhocWitness
        witnessB = (await AdhocWitness.create(paramsB)) as AdhocWitness
        archivistA = await MemoryArchivist.create({ account: await HDWallet.random() })
        archivistB = await MemoryArchivist.create({ account: await HDWallet.random() })
      })
      it('config', async () => {
        const node = await MemoryNode.create({ account: await HDWallet.random() })
        await Promise.all(
          [witnessA, witnessB, archivistA, archivistB].map(async (module) => {
            await node.register(module)
            await node.attach(module.address, true)
          }),
        )
        const params: MemorySentinelParams<SentinelConfig> = {
          account: await HDWallet.random(),
          config: {
            archiving: {
              archivists: [archivistA.address, archivistB.address],
            },
            schema: SentinelConfigSchema,
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
        const wrapper = SentinelWrapper.wrap(sentinel, await HDWallet.random())
        const result = await wrapper.report()
        assertPanelReport(result)
        await assertArchivistStateMatchesPanelReport(result, [archivistA, archivistB])
      })
    })
  })
})
