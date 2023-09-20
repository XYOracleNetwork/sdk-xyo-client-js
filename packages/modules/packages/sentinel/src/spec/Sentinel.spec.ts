/* eslint-disable import/no-deprecated */

import { HDWallet } from '@xyo-network/account'
import { Archivist, ArchivistInstance, MemoryArchivist } from '@xyo-network/archivist'
import { BoundWitness, BoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { BoundWitnessValidator } from '@xyo-network/boundwitness-validator'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { PayloadHasher } from '@xyo-network/core'
import { IdWitness, IdWitnessConfigSchema } from '@xyo-network/id-plugin'
import { MemoryNode } from '@xyo-network/node-memory'
import { NodeSystemInfoWitness, NodeSystemInfoWitnessConfigSchema } from '@xyo-network/node-system-info-plugin'
import { Payload, PayloadSchema } from '@xyo-network/payload-model'
import { ReportEndEventArgs, SentinelConfig, SentinelConfigSchema } from '@xyo-network/sentinel-model'
import { AbstractWitness } from '@xyo-network/witness'
import { AdhocWitness, AdhocWitnessConfigSchema } from '@xyo-network/witnesses'

import { MemorySentinel, MemorySentinelParams } from '../MemorySentinel'

describe('Sentinel', () => {
  test('all [simple panel send]', async () => {
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
      archivists: [archivist.address],
      schema: SentinelConfigSchema,
      witnesses: witnesses.map((witness) => witness.address),
    }

    const sentinel = (await MemorySentinel.create({ account: await HDWallet.random(), config })) as MemorySentinel
    await node.register(sentinel)
    await node.attach(sentinel.address)
    expect(await sentinel.archivists()).toBeArrayOfSize(1)
    expect(await sentinel.witnesses()).toBeArrayOfSize(2)
    const adhocWitness = (await AdhocWitness.create({
      account: await HDWallet.random(),
      config: {
        payload: {
          schema: 'network.xyo.test.array',
          testArray: [1, 2, 3],
          testBoolean: true,
          testNull: null,
          testNullObject: { t: null, x: undefined },
          testNumber: 5,
          testObject: { t: 1 },
          testSomeNullObject: { s: 1, t: null, x: undefined },
          testString: 'hi',
          testUndefined: undefined,
        },
        schema: AdhocWitnessConfigSchema,
      },
    })) as AdhocWitness

    const adhocObserved = await adhocWitness.observe(adhocWitness.config.payload ? [adhocWitness.config.payload] : [])

    const report1Result = await sentinel.report(adhocObserved)
    const report1 = BoundWitnessWrapper.parse(report1Result[0])
    expect(report1.schema()).toBe(BoundWitnessSchema)
    expect(report1.payloadHashes).toBeArrayOfSize(3)
    const report2 = BoundWitnessWrapper.parse((await sentinel.report())[0])
    expect(report2.schema()).toBeDefined()
    expect(report2.payloadHashes).toBeArrayOfSize(2)
    expect(report2.hashSync() !== report1.hashSync()).toBe(true)
    expect(report2.prev(sentinel.address)).toBeDefined()
    //expect(report2.prev(panel.address)).toBe(report1.hash)
    expect(await report1.getValid()).toBe(true)
    expect(await report2.getValid()).toBe(true)
  })
  describe('report', () => {
    describe('reports witnesses when supplied in', () => {
      let archivistA: ArchivistInstance
      let archivistB: ArchivistInstance
      let witnessA: AbstractWitness
      let witnessB: AbstractWitness
      const assertPanelReport = async (panelReport: Payload[]) => {
        expect(panelReport).toBeArrayOfSize(3)
        const [bw, ...payloads] = panelReport
        expect(await new BoundWitnessValidator(bw as BoundWitness).validate()).toBeArrayOfSize(0)
        expect(payloads).toBeArrayOfSize(2)
      }
      const assertArchivistStateMatchesPanelReport = async (payloads: Payload[], archivists: Archivist[]) => {
        for (const archivist of archivists) {
          const archivistPayloads = await archivist.all?.()
          expect(archivistPayloads).toBeArrayOfSize(payloads.length)
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
            await node.attach(module.address)
          }),
        )
        const params: MemorySentinelParams<SentinelConfig> = {
          account: await HDWallet.random(),
          config: {
            archivists: [archivistA.address, archivistB.address],

            schema: SentinelConfigSchema,
            witnesses: [witnessA.address, witnessB.address],
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
        const result = await sentinel.report()
        await assertPanelReport(result)
        await assertArchivistStateMatchesPanelReport(result, [archivistA, archivistB])
      })
      it('config & inline', async () => {
        const node = await MemoryNode.create({ account: await HDWallet.random() })
        await Promise.all(
          [witnessA, archivistA, archivistB].map(async (module) => {
            await node.register(module)
            await node.attach(module.address)
          }),
        )
        const params: MemorySentinelParams<SentinelConfig> = {
          account: await HDWallet.random(),
          config: {
            archivists: [archivistA.address, archivistB.address],

            schema: SentinelConfigSchema,
            witnesses: [witnessA.address],
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
        const observed = await witnessB.observe()
        expect(observed).toBeArrayOfSize(1)
        const result = await sentinel.report(observed)
        await assertPanelReport(result)
        await assertArchivistStateMatchesPanelReport(result, [archivistA, archivistB])
      })
      it('inline', async () => {
        const node = await MemoryNode.create({ account: await HDWallet.random() })
        await Promise.all(
          [archivistA, archivistB].map(async (module) => {
            await node.register(module)
            await node.attach(module.address)
          }),
        )
        const params: MemorySentinelParams<SentinelConfig> = {
          account: await HDWallet.random(),
          config: {
            archivists: [archivistA.address, archivistB.address],

            schema: SentinelConfigSchema,
            witnesses: [],
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
        const observedA = await witnessA.observe()
        expect(observedA).toBeArrayOfSize(1)
        const observedB = await witnessB.observe()
        expect(observedB).toBeArrayOfSize(1)
        const result = await sentinel.report([...observedA, ...observedB])
        await assertPanelReport(result)
        expect((await archivistA.get([PayloadHasher.hashSync(observedA[0])])).length).toBe(1)
        expect((await archivistA.get([PayloadHasher.hashSync(observedB[0])])).length).toBe(1)
        expect((await archivistB.get([PayloadHasher.hashSync(observedA[0])])).length).toBe(1)
        expect((await archivistB.get([PayloadHasher.hashSync(observedB[0])])).length).toBe(1)
        await assertArchivistStateMatchesPanelReport(result, [archivistA, archivistB])
      })
      it('reports errors', async () => {
        const paramsA = {
          account: await HDWallet.random(),
          config: {
            payload: { nonce: Math.floor(Math.random() * 9999999), schema: 'network.xyo.test' },
            schema: AdhocWitnessConfigSchema,
          },
        }
        class FailingWitness extends AdhocWitness {
          protected override async observeHandler(): Promise<Payload[]> {
            await Promise.reject(Error('observation failed'))
            return [{ schema: 'fake.result' }]
          }
        }
        const witnessA = await FailingWitness.create(paramsA)

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
            witnesses: [witnessA.address, witnessB.address],
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
        await sentinel.report()
        return
      })
    })
  })
})
