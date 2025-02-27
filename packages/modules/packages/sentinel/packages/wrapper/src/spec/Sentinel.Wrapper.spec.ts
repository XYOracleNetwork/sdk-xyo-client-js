import '@xylabs/vitest-extended'

import { delay } from '@xylabs/delay'
import { AbstractWitness } from '@xyo-network/abstract-witness'
import { Account } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { Archivist, AttachableArchivistInstance } from '@xyo-network/archivist-model'
import { BoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { AttachableModuleInstance } from '@xyo-network/module-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload, PayloadSchema } from '@xyo-network/payload-model'
import { MemorySentinel, MemorySentinelParams } from '@xyo-network/sentinel-memory'
import {
  ReportEndEventArgs, SentinelConfig, SentinelConfigSchema,
} from '@xyo-network/sentinel-model'
import { AdhocWitness, AdhocWitnessConfigSchema } from '@xyo-network/witness-adhoc'
import {
  beforeEach,
  describe, expect,
  it, test,
} from 'vitest'

import { SentinelWrapper } from '../Wrapper.ts'

/**
 * @group sentinel
 * @group module
 */

describe('Sentinel', () => {
  test('all [simple sentinel report]', async () => {
    const node = await MemoryNode.create({ account: 'random' })
    const archivist = await MemoryArchivist.create({ account: 'random' })
    await node.register(archivist)
    await node.attach(archivist.address)

    const witnesses: AbstractWitness[] = [await AdhocWitness.create({ account: 'random', config: { schema: AdhocWitnessConfigSchema } })]

    await Promise.all(
      witnesses.map(async (witness) => {
        await node.register(witness)
        await node.attach(witness.address)
      }),
    )

    const config: SentinelConfig = {
      archiving: { archivists: [archivist.address] },
      schema: SentinelConfigSchema,
      synchronous: true,
      tasks: witnesses.map(witness => ({ mod: witness.address })),
    }

    const sentinel = (await MemorySentinel.create({ account: 'random', config })) as MemorySentinel
    await node.register(sentinel)
    await node.attach(sentinel.address)

    const report1Result = await sentinel.report()
    const report1 = report1Result.at(0)
    expect(report1?.schema).toBe(BoundWitnessSchema)
  })
  describe('report', () => {
    describe('reports witnesses when supplied in', () => {
      let archivistA: AttachableArchivistInstance
      let archivistB: AttachableArchivistInstance
      let witnessA: AbstractWitness
      let witnessB: AbstractWitness
      const assertPanelReport = (panelReport: Payload[]) => {
        expect(panelReport).toBeArrayOfSize(3)
      }
      const assertArchivistStateMatchesPanelReport = async (payloads: Payload[], archivists: Archivist[]) => {
        // delay to wait for archiving to happen
        await delay(1000)
        for (const archivist of archivists) {
          const archivistPayloads = await archivist.all?.()
          expect(archivistPayloads).toBeArrayOfSize(payloads.length + 1)
          const panelPayloads = await Promise.all(
            payloads.map((payload) => {
              return PayloadBuilder.omitStorageMeta(payload)
            }),
          )
          const archivistDataHashes = await PayloadBuilder.dataHashes(archivistPayloads)
          const panelDataHashes = await PayloadBuilder.dataHashes(panelPayloads)
          expect(archivistDataHashes).toContainValues(panelDataHashes)
        }
      }
      beforeEach(async () => {
        const paramsA = {
          account: 'random' as const,
          config: {
            payload: { nonce: Date.now() * 8, schema: 'network.xyo.test' },
            schema: AdhocWitnessConfigSchema,
            targetSchema: PayloadSchema,
          },
        }
        const paramsB = {
          account: 'random' as const,
          config: {
            payload: { nonce: Date.now() * 9, schema: 'network.xyo.test' },
            schema: AdhocWitnessConfigSchema,
            targetSchema: PayloadSchema,
          },
        }
        witnessA = await AdhocWitness.create(paramsA)
        witnessB = await AdhocWitness.create(paramsB)
        archivistA = await MemoryArchivist.create({ account: 'random' })
        archivistB = await MemoryArchivist.create({ account: 'random' })
      })
      it('config', async () => {
        const node = await MemoryNode.create({ account: 'random' })
        const modules: AttachableModuleInstance[] = [witnessA, witnessB, archivistA, archivistB]
        await Promise.all(
          modules.map(async (mod) => {
            await node.register(mod)
            await node.attach(mod.address, true)
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
          expect(outPayloads?.length).toBeGreaterThan(0)
        })
        await node.register(sentinel)
        await node.attach(sentinel.address)
        // using a wrapper to trigger archiving
        const wrapper = SentinelWrapper.wrap(sentinel, await Account.random())
        const result = await wrapper.report()
        assertPanelReport(result)
        await assertArchivistStateMatchesPanelReport(result, [archivistA, archivistB])
      })
    })
  })
})
