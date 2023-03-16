/* eslint-disable deprecation/deprecation */
/* eslint-disable import/no-deprecated */

import { AbstractArchivist, Archivist, MemoryArchivist } from '@xyo-network/archivist'
import { XyoBoundWitness, XyoBoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { BoundWitnessValidator } from '@xyo-network/boundwitness-validator'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { Hasher } from '@xyo-network/core'
import { IdWitness, IdWitnessConfigSchema } from '@xyo-network/id-plugin'
import { MemoryNode } from '@xyo-network/node'
import { XyoNodeSystemInfoWitness, XyoNodeSystemInfoWitnessConfigSchema } from '@xyo-network/node-system-info-plugin'
import { XyoPayload, XyoPayloadSchema } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { AbstractWitness } from '@xyo-network/witness'
import { XyoAdhocWitness, XyoAdhocWitnessConfigSchema } from '@xyo-network/witnesses'

import { SentinelConfig, SentinelConfigSchema } from '../Config'
import { MemorySentinel, MemorySentinelParams } from '../MemorySentinel'
import { SentinelReportEndEventArgs } from '../SentinelModel'

describe('XyoPanel', () => {
  test('all [simple panel send]', async () => {
    const node = await MemoryNode.create()
    const archivist = await MemoryArchivist.create()
    await node.register(archivist).attach(archivist.address)

    const witnesses: AbstractWitness[] = [
      await IdWitness.create({ config: { salt: 'test', schema: IdWitnessConfigSchema } }),
      await XyoNodeSystemInfoWitness.create({
        config: {
          nodeValues: {
            osInfo: '*',
          },
          schema: XyoNodeSystemInfoWitnessConfigSchema,
        },
      }),
    ]

    await Promise.all(witnesses.map(async (witness) => await node.register(witness).attach(witness.address)))

    const config: SentinelConfig = {
      archivists: [archivist.address],
      schema: SentinelConfigSchema,
      witnesses: witnesses.map((witness) => witness.address),
    }

    const panel = (await MemorySentinel.create({ config })) as MemorySentinel
    await node.register(panel).attach(panel.address)
    expect(await panel.getArchivists()).toBeArrayOfSize(1)
    expect(await panel.getWitnesses()).toBeArrayOfSize(2)
    const adhocWitness = (await XyoAdhocWitness.create({
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
        schema: XyoAdhocWitnessConfigSchema,
      },
    })) as XyoAdhocWitness

    const adhocObserved = await adhocWitness.observe(adhocWitness.config.payload ? [adhocWitness.config.payload] : [])

    const report1Result = await panel.report(adhocObserved)
    const report1 = BoundWitnessWrapper.parse(report1Result[0])
    expect(report1.schemaName).toBe(XyoBoundWitnessSchema)
    expect(report1.payloadHashes).toBeArrayOfSize(3)
    const report2 = BoundWitnessWrapper.parse((await panel.report())[0])
    expect(report2.schemaName).toBeDefined()
    expect(report2.payloadHashes).toBeArrayOfSize(2)
    expect(report2.hash !== report1.hash).toBe(true)
    expect(report2.prev(panel.address)).toBeDefined()
    //expect(report2.prev(panel.address)).toBe(report1.hash)
    expect(report1.valid).toBe(true)
    expect(report2.valid).toBe(true)
  })
  describe('report', () => {
    describe('reports witnesses when supplied in', () => {
      let archivistA: AbstractArchivist
      let archivistB: AbstractArchivist
      let witnessA: AbstractWitness
      let witnessB: AbstractWitness
      const assertPanelReport = (panelReport: XyoPayload[]) => {
        expect(panelReport).toBeArrayOfSize(3)
        const [bw, ...payloads] = panelReport
        expect(new BoundWitnessValidator(bw as XyoBoundWitness).validate()).toBeArrayOfSize(0)
        expect(payloads).toBeArrayOfSize(2)
      }
      const assertArchivistStateMatchesPanelReport = async (payloads: XyoPayload[], archivists: Archivist[]) => {
        for (const archivist of archivists) {
          const archivistPayloads = await archivist.all?.()
          expect(archivistPayloads).toBeArrayOfSize(payloads.length)
          const panelPayloads = payloads.map((payload) => {
            const wrapped = new PayloadWrapper(payload)
            return { ...payload, _hash: wrapped.hash, _timestamp: expect.toBeNumber() }
          })
          expect(archivistPayloads).toContainValues(panelPayloads)
        }
      }
      beforeEach(async () => {
        const paramsA = {
          config: {
            payload: { nonce: Math.floor(Math.random() * 9999999), schema: 'network.xyo.test' },
            schema: XyoAdhocWitnessConfigSchema,
            targetSchema: XyoPayloadSchema,
          },
        }
        const paramsB = {
          config: {
            payload: { nonce: Math.floor(Math.random() * 9999999), schema: 'network.xyo.test' },
            schema: XyoAdhocWitnessConfigSchema,
            targetSchema: XyoPayloadSchema,
          },
        }
        witnessA = (await XyoAdhocWitness.create(paramsA)) as XyoAdhocWitness
        witnessB = (await XyoAdhocWitness.create(paramsB)) as XyoAdhocWitness
        archivistA = await MemoryArchivist.create()
        archivistB = await MemoryArchivist.create()
      })
      it('config', async () => {
        const node = await MemoryNode.create()
        await Promise.all([witnessA, witnessB, archivistA, archivistB].map(async (module) => await node.register(module).attach(module.address)))
        const params: MemorySentinelParams<SentinelConfig> = {
          config: {
            archivists: [archivistA.address, archivistB.address],

            schema: SentinelConfigSchema,
            witnesses: [witnessA.address, witnessB.address],
          },
        }
        const sentinel = await MemorySentinel.create(params)
        sentinel.on('reportEnd', (args) => {
          const { errors } = args as SentinelReportEndEventArgs
          console.log('reportEnd')
          expect(errors).toBeArrayOfSize(0)
        })
        await node.register(sentinel).attach(sentinel.address)
        const result = await sentinel.report()
        assertPanelReport(result)
        await assertArchivistStateMatchesPanelReport(result, [archivistA, archivistB])
      })
      it('config & inline', async () => {
        const node = await MemoryNode.create()
        await Promise.all([witnessA, archivistA, archivistB].map(async (module) => await node.register(module).attach(module.address)))
        const params: MemorySentinelParams<SentinelConfig> = {
          config: {
            archivists: [archivistA.address, archivistB.address],

            schema: SentinelConfigSchema,
            witnesses: [witnessA.address],
          },
        }
        const panel = await MemorySentinel.create(params)
        panel.on('reportEnd', (args) => {
          const { errors } = args as SentinelReportEndEventArgs
          console.log('reportEnd')
          expect(errors).toBeArrayOfSize(0)
        })
        await node.register(panel).attach(panel.address)
        const observed = await witnessB.observe()
        expect(observed).toBeArrayOfSize(1)
        const result = await panel.report(observed)
        assertPanelReport(result)
        await assertArchivistStateMatchesPanelReport(result, [archivistA, archivistB])
      })
      it('inline', async () => {
        const node = await MemoryNode.create()
        await Promise.all([archivistA, archivistB].map(async (module) => await node.register(module).attach(module.address)))
        const params: MemorySentinelParams<SentinelConfig> = {
          config: {
            archivists: [archivistA.address, archivistB.address],

            schema: SentinelConfigSchema,
            witnesses: [],
          },
        }
        const panel = await MemorySentinel.create(params)
        panel.on('reportEnd', (args) => {
          const { errors } = args as SentinelReportEndEventArgs
          expect(errors).toBeArrayOfSize(0)
        })
        await node.register(panel).attach(panel.address)
        const observedA = await witnessA.observe()
        expect(observedA).toBeArrayOfSize(1)
        const observedB = await witnessB.observe()
        expect(observedB).toBeArrayOfSize(1)
        const result = await panel.report([...observedA, ...observedB])
        assertPanelReport(result)
        expect((await archivistA.get([Hasher.hash(observedA[0])])).length).toBe(1)
        expect((await archivistA.get([Hasher.hash(observedB[0])])).length).toBe(1)
        expect((await archivistB.get([Hasher.hash(observedA[0])])).length).toBe(1)
        expect((await archivistB.get([Hasher.hash(observedB[0])])).length).toBe(1)
        await assertArchivistStateMatchesPanelReport(result, [archivistA, archivistB])
      })
      it('reports errors', async () => {
        const paramsA = {
          config: {
            payload: { nonce: Math.floor(Math.random() * 9999999), schema: 'network.xyo.test' },
            schema: XyoAdhocWitnessConfigSchema,
          },
        }
        class FailingWitness extends XyoAdhocWitness {
          override async observe(): Promise<XyoPayload[]> {
            await Promise.reject(Error('observation failed'))
            return [{ schema: 'fake.result' }]
          }
        }
        const witnessA = await FailingWitness.create(paramsA)

        const node = await MemoryNode.create()
        await Promise.all([witnessA, witnessB, archivistA, archivistB].map(async (module) => await node.register(module).attach(module.address)))
        const params: MemorySentinelParams<SentinelConfig> = {
          config: {
            archivists: [archivistA.address, archivistB.address],

            schema: SentinelConfigSchema,
            witnesses: [witnessA.address, witnessB.address],
          },
        }

        const sentinel = await MemorySentinel.create(params)
        sentinel.on('reportEnd', (args) => {
          const { errors } = args as SentinelReportEndEventArgs
          console.log('reportEnd')
          expect(errors?.length).toBe(1)
          expect(errors?.[0]?.message).toBe('observation failed')
        })
        await node.register(sentinel).attach(sentinel.address)
        await sentinel.report()
        return
      })
    })
  })
})
