import { AbstractArchivist, Archivist, MemoryArchivist } from '@xyo-network/archivist'
import { BoundWitnessValidator, BoundWitnessWrapper, XyoBoundWitness, XyoBoundWitnessSchema } from '@xyo-network/boundwitness'
import { XyoIdSchema, XyoIdWitness, XyoIdWitnessConfigSchema } from '@xyo-network/id-payload-plugin'
import { XyoModuleParams, XyoModuleResolver } from '@xyo-network/module'
import { XyoNodeSystemInfoSchema, XyoNodeSystemInfoWitness, XyoNodeSystemInfoWitnessConfigSchema } from '@xyo-network/node-system-info-payload-plugin'
import { PayloadWrapper, XyoPayload, XyoPayloadSchema } from '@xyo-network/payload'
import { AbstractWitness } from '@xyo-network/witness'
import { XyoAdhocWitness, XyoAdhocWitnessConfigSchema } from '@xyo-network/witnesses'

import { XyoPanel, XyoPanelConfig, XyoPanelConfigSchema } from './XyoPanel'

describe('XyoPanel', () => {
  test('all [simple panel send]', async () => {
    const archivist = await MemoryArchivist.create()

    const witnesses: AbstractWitness[] = [
      await XyoIdWitness.create({ config: { salt: 'test', schema: XyoIdWitnessConfigSchema, targetSchema: XyoIdSchema } }),
      await XyoNodeSystemInfoWitness.create({
        config: {
          nodeValues: {
            osInfo: '*',
          },
          schema: XyoNodeSystemInfoWitnessConfigSchema,
          targetSchema: XyoNodeSystemInfoSchema,
        },
      }),
    ]

    const config: XyoPanelConfig = {
      archivists: [archivist.address],
      schema: XyoPanelConfigSchema,
      witnesses: witnesses.map((witness) => witness.address),
    }

    const resolver = new XyoModuleResolver()
    resolver.add(archivist)
    witnesses.forEach((witness) => resolver.add(witness))

    const panel = await XyoPanel.create({ config, resolver })
    expect(await panel.getArchivists()).toBeArrayOfSize(1)
    expect(await panel.getWitnesses()).toBeArrayOfSize(2)
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
        targetSchema: XyoPayloadSchema,
      },
    })

    const adhocObserved = await adhocWitness.observe()

    const report1Result = await panel.report(adhocObserved)
    const report1 = BoundWitnessWrapper.parse(report1Result[1][0])
    expect(report1.schemaName).toBe(XyoBoundWitnessSchema)
    expect(report1.payloadHashes).toBeArrayOfSize(2)
    const report2 = BoundWitnessWrapper.parse((await panel.report())[1][0])
    expect(report2.schemaName).toBeDefined()
    expect(report2.payloadHashes).toBeArrayOfSize(1)
    expect(report2.hash !== report1.hash).toBe(true)
    expect(report2.prev(panel.address)).toBeDefined()
    expect(report2.prev(panel.address)).toBe(report1.hash)
    expect(report1.valid).toBe(true)
    expect(report2.valid).toBe(true)
  })
  describe('report', () => {
    describe('reports witnesses when supplied in', () => {
      let archivistA: AbstractArchivist
      let archivistB: AbstractArchivist
      let witnessA: AbstractWitness
      let witnessB: AbstractWitness
      const assertPanelReport = (panelReport: [XyoBoundWitness[], XyoPayload[]]) => {
        expect(panelReport).toBeArrayOfSize(2)
        const [bws, payloads] = panelReport
        expect(bws).toBeArrayOfSize(4)
        bws.map((bw) => expect(new BoundWitnessValidator(bw).validate()).toBeArrayOfSize(0))
        expect(payloads).toBeArrayOfSize(3)
      }
      const assertArchivistStateMatchesPanelReport = async (panelReport: [XyoBoundWitness[], XyoPayload[]], archivists: Archivist[]) => {
        const [, payloads] = panelReport
        for (const archivist of archivists) {
          const archivistPayloads = await archivist.all?.()
          expect(archivistPayloads).toBeArrayOfSize(payloads.length - 1)
          const panelPayloads = payloads.map((payload) => {
            const wrapped = new PayloadWrapper(payload)
            return { ...payload, _hash: wrapped.hash, _timestamp: expect.toBeNumber() }
          })
          expect(archivistPayloads).toContainValues(panelPayloads)
        }
      }
      beforeEach(async () => {
        const params = {
          config: {
            payload: { nonce: Math.floor(Math.random() * 9999999), schema: 'network.xyo.test' },
            schema: XyoAdhocWitnessConfigSchema,
            targetSchema: XyoPayloadSchema,
          },
        }
        witnessA = await XyoAdhocWitness.create(params)
        witnessB = await XyoAdhocWitness.create(params)
        archivistA = await MemoryArchivist.create()
        archivistB = await MemoryArchivist.create()
      })
      it('config', async () => {
        const resolver = new XyoModuleResolver()
        resolver.add([witnessA, witnessB, archivistA, archivistB])
        const params: XyoModuleParams<XyoPanelConfig> = {
          config: {
            archivists: [archivistA.address, archivistB.address],
            schema: 'network.xyo.panel.config',
            witnesses: [witnessA.address, witnessB.address],
          },
          resolver,
        }
        const panel = await XyoPanel.create(params)
        const result = await panel.report()
        assertPanelReport(result)
        await assertArchivistStateMatchesPanelReport(result, [archivistA, archivistB])
      })
      it('config & inline', async () => {
        const resolver = new XyoModuleResolver()
        resolver.add([witnessA, archivistA, archivistB])
        const params: XyoModuleParams<XyoPanelConfig> = {
          config: {
            archivists: [archivistA.address, archivistB.address],
            schema: 'network.xyo.panel.config',
            witnesses: [witnessA.address],
          },
          resolver,
        }
        const panel = await XyoPanel.create(params)
        const observed = await witnessB.observe()
        expect(observed).toBeArrayOfSize(1)
        const result = await panel.report(observed)
        assertPanelReport(result)
        await assertArchivistStateMatchesPanelReport(result, [archivistA, archivistB])
      })
      it('inline', async () => {
        const resolver = new XyoModuleResolver()
        resolver.add([archivistA, archivistB])
        const params: XyoModuleParams<XyoPanelConfig> = {
          config: {
            archivists: [archivistA.address, archivistB.address],
            schema: 'network.xyo.panel.config',
            witnesses: [],
          },
          resolver,
        }
        const panel = await XyoPanel.create(params)
        const observedA = await witnessA.observe()
        expect(observedA).toBeArrayOfSize(1)
        const observedB = await witnessB.observe()
        expect(observedB).toBeArrayOfSize(1)
        const result = await panel.report([...observedA, ...observedB])
        assertPanelReport(result)
        await assertArchivistStateMatchesPanelReport(result, [archivistA, archivistB])
      })
    })
  })
})
