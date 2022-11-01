import { Archivist, XyoArchivist, XyoMemoryArchivist } from '@xyo-network/archivist'
import { BoundWitnessWrapper, XyoBoundWitness, XyoBoundWitnessSchema } from '@xyo-network/boundwitness'
import { XyoIdSchema, XyoIdWitness, XyoIdWitnessConfigSchema } from '@xyo-network/id-payload-plugin'
import { XyoModuleParams, XyoModuleResolver } from '@xyo-network/module'
import { XyoNodeSystemInfoSchema, XyoNodeSystemInfoWitness, XyoNodeSystemInfoWitnessConfigSchema } from '@xyo-network/node-system-info-payload-plugin'
import { PayloadWrapper, XyoPayload, XyoPayloadSchema } from '@xyo-network/payload'
import { XyoWitness } from '@xyo-network/witness'
import { XyoAdhocWitness, XyoAdhocWitnessConfigSchema } from '@xyo-network/witnesses'

import { XyoPanel, XyoPanelConfig, XyoPanelConfigSchema } from './XyoPanel'

describe('XyoPanel', () => {
  test('all [simple panel send]', async () => {
    const archivist = await XyoMemoryArchivist.create()

    const witnesses: XyoWitness[] = [
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
    expect(panel.archivists.length).toBe(1)
    expect(panel.witnesses.length).toBe(2)
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

    const [adhocObserved] = await adhocWitness.observe()
    expect(new PayloadWrapper(adhocObserved).valid).toBe(true)

    const report1Result = await panel.report([adhocWitness])
    const report1 = BoundWitnessWrapper.parse(report1Result[1][0])
    expect(report1.schemaName).toBe(XyoBoundWitnessSchema)
    expect(report1.payloadHashes.length).toBe(3)
    const report2 = BoundWitnessWrapper.parse((await panel.report())[1][0])
    expect(report2.schemaName).toBeDefined()
    expect(report2.payloadHashes.length).toBe(2)
    expect(report2.hash !== report1.hash).toBe(true)
    expect(report2.prev(panel.address)).toBeDefined()
    expect(report2.prev(panel.address)).toBe(report1.hash)
    expect(report1.valid).toBe(true)
    expect(report2.valid).toBe(true)
  })
  describe('report', () => {
    let witnessA: XyoWitness
    let witnessB: XyoWitness
    let archivistA: XyoArchivist
    let archivistB: XyoArchivist
    beforeEach(async () => {
      witnessA = await XyoIdWitness.create({ config: { salt: 'witnessA', schema: XyoIdWitnessConfigSchema, targetSchema: XyoIdSchema } })
      witnessB = await XyoIdWitness.create({ config: { salt: 'witnessB', schema: XyoIdWitnessConfigSchema, targetSchema: XyoIdSchema } })
      archivistA = await XyoMemoryArchivist.create()
      archivistB = await XyoMemoryArchivist.create()
    })
    describe('reports witnesses when supplied in', () => {
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
        await assertPostTestState(result, [archivistA, archivistB])
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
        const result = await panel.report([witnessB])
        await assertPostTestState(result, [archivistA, archivistB])
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
        const result = await panel.report([witnessA, witnessB])
        await assertPostTestState(result, [archivistA, archivistB])
      })
    })
  })
})

const assertPostTestState = async (panelReport: [XyoBoundWitness[], XyoPayload[]], archivists: Archivist[]) => {
  expect(panelReport).toBeArrayOfSize(2)
  const [bws, payloads] = panelReport
  expect(bws).toBeArrayOfSize(4)
  expect(payloads).toBeArrayOfSize(3)
  for (const archivist of archivists) {
    const archivistPayloads = await archivist.all?.()
    expect(archivistPayloads).toBeArrayOfSize(3)
    const panelPayloads = payloads.map((payload) => {
      const wrapped = new PayloadWrapper(payload)
      return { ...payload, _hash: wrapped.hash, _timestamp: expect.toBeNumber() }
    })
    expect(archivistPayloads).toContainValues(panelPayloads)
  }
}
