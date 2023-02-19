import { AbstractArchivist, Archivist, MemoryArchivist } from '@xyo-network/archivist'
import { XyoBoundWitness, XyoBoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { BoundWitnessValidator } from '@xyo-network/boundwitness-validator'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { Hasher } from '@xyo-network/core'
import { IdWitness, IdWitnessConfigSchema } from '@xyo-network/id-plugin'
import { CompositeModuleResolver, ModuleParams } from '@xyo-network/module'
import { XyoNodeSystemInfoWitness, XyoNodeSystemInfoWitnessConfigSchema } from '@xyo-network/node-system-info-plugin'
import { XyoPayload, XyoPayloadSchema } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { AbstractWitness } from '@xyo-network/witness'
import { XyoAdhocWitness, XyoAdhocWitnessConfigSchema } from '@xyo-network/witnesses'

import { AbstractSentinel } from '../AbstractSentinel'
import { SentinelConfig, SentinelConfigSchema } from '../Config'

describe('Sentinel', () => {
  test('all [simple sentinel send]', async () => {
    const archivist = await MemoryArchivist.create()

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

    const config: SentinelConfig = {
      archivists: [archivist.address],
      schema: SentinelConfigSchema,
      witnesses: witnesses.map((witness) => witness.address),
    }

    const resolver = new CompositeModuleResolver()
    resolver.add(archivist)
    witnesses.forEach((witness) => resolver.add(witness))

    const sentinel = await AbstractSentinel.create({ config, resolver })
    expect(await sentinel.getArchivists()).toBeArrayOfSize(1)
    expect(await sentinel.getWitnesses()).toBeArrayOfSize(2)
    const adhocWitness = await XyoAdhocWitness.create({
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
    })

    const adhocObserved = await adhocWitness.observe([adhocWitness.config.payload])

    const report1Result = await sentinel.report(adhocObserved)
    const report1 = BoundWitnessWrapper.parse(report1Result[0])
    expect(report1.schemaName).toBe(XyoBoundWitnessSchema)
    expect(report1.payloadHashes).toBeArrayOfSize(3)
    const report2 = BoundWitnessWrapper.parse((await sentinel.report())[0])
    expect(report2.schemaName).toBeDefined()
    expect(report2.payloadHashes).toBeArrayOfSize(2)
    expect(report2.hash !== report1.hash).toBe(true)
    expect(report2.prev(sentinel.address)).toBeDefined()
    expect(report2.prev(sentinel.address)).toBe(report1.hash)
    expect(report1.valid).toBe(true)
    expect(report2.valid).toBe(true)
  })
  describe('report', () => {
    describe('reports witnesses when supplied in', () => {
      let archivistA: AbstractArchivist
      let archivistB: AbstractArchivist
      let witnessA: AbstractWitness
      let witnessB: AbstractWitness
      const assertSentinelReport = (sentinelReport: [XyoBoundWitness, XyoPayload[]]) => {
        expect(sentinelReport).toBeArrayOfSize(2)
        const [bw, payloads] = sentinelReport
        expect(new BoundWitnessValidator(bw).validate()).toBeArrayOfSize(0)
        expect(payloads).toBeArrayOfSize(2)
      }
      const assertArchivistStateMatchesSentinelReport = async (sentinelReport: [XyoBoundWitness, XyoPayload[]], archivists: Archivist[]) => {
        const [, payloads] = sentinelReport
        for (const archivist of archivists) {
          const archivistPayloads = await archivist.all?.()
          expect(archivistPayloads).toBeArrayOfSize(payloads.length + 1)
          const sentinelPayloads = payloads.map((payload) => {
            const wrapped = new PayloadWrapper(payload)
            return { ...payload, _hash: wrapped.hash, _timestamp: expect.toBeNumber() }
          })
          expect(archivistPayloads).toContainValues(sentinelPayloads)
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
        witnessA = await XyoAdhocWitness.create(paramsA)
        witnessB = await XyoAdhocWitness.create(paramsB)
        archivistA = await MemoryArchivist.create()
        archivistB = await MemoryArchivist.create()
      })
      it('config', async () => {
        const resolver = new CompositeModuleResolver()
        resolver.add([witnessA, witnessB, archivistA, archivistB])
        const params: ModuleParams<SentinelConfig> = {
          config: {
            archivists: [archivistA.address, archivistB.address],
            schema: 'network.xyo.sentinel.config',
            witnesses: [witnessA.address, witnessB.address],
          },
          resolver,
        }
        const sentinel = await AbstractSentinel.create(params)
        const result = await sentinel.report()
        assertSentinelReport(result)
        await assertArchivistStateMatchesSentinelReport(result, [archivistA, archivistB])
      })
      it('config & inline', async () => {
        const resolver = new CompositeModuleResolver()
        resolver.add([witnessA, archivistA, archivistB])
        const params: ModuleParams<SentinelConfig> = {
          config: {
            archivists: [archivistA.address, archivistB.address],
            schema: 'network.xyo.sentinel.config',
            witnesses: [witnessA.address],
          },
          resolver,
        }
        const sentinel = await AbstractSentinel.create(params)
        const observed = await witnessB.observe()
        expect(observed).toBeArrayOfSize(1)
        const result = await sentinel.report(observed)
        assertSentinelReport(result)
        await assertArchivistStateMatchesSentinelReport(result, [archivistA, archivistB])
      })
      it('inline', async () => {
        const resolver = new CompositeModuleResolver()
        resolver.add([archivistA, archivistB])
        const params: ModuleParams<SentinelConfig> = {
          config: {
            archivists: [archivistA.address, archivistB.address],
            schema: 'network.xyo.sentinel.config',
            witnesses: [],
          },
          resolver,
        }
        const sentinel = await AbstractSentinel.create(params)
        const observedA = await witnessA.observe()
        expect(observedA).toBeArrayOfSize(1)
        const observedB = await witnessB.observe()
        expect(observedB).toBeArrayOfSize(1)
        const result = await sentinel.report([...observedA, ...observedB])
        assertSentinelReport(result)
        expect((await archivistA.get([Hasher.hash(observedA[0])])).length).toBe(1)
        expect((await archivistA.get([Hasher.hash(observedB[0])])).length).toBe(1)
        expect((await archivistB.get([Hasher.hash(observedA[0])])).length).toBe(1)
        expect((await archivistB.get([Hasher.hash(observedB[0])])).length).toBe(1)
        await assertArchivistStateMatchesSentinelReport(result, [archivistA, archivistB])
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

        const resolver = new CompositeModuleResolver()
        resolver.add([witnessA, witnessB, archivistA, archivistB])
        const params: ModuleParams<SentinelConfig> = {
          config: {
            archivists: [archivistA.address, archivistB.address],
            onReportEnd(_, errors) {
              expect(errors?.length).toBe(1)
              expect(errors?.[0]?.message).toBe('observation failed')
            },
            schema: 'network.xyo.sentinel.config',
            witnesses: [witnessA.address, witnessB.address],
          },
          resolver,
        }
        const sentinel = await AbstractSentinel.create(params)
        await sentinel.report()
        return
      })
    })
  })
})
