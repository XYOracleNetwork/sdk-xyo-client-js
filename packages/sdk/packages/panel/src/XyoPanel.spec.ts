import { XyoMemoryArchivist } from '@xyo-network/archivist'
import { XyoBoundWitnessSchema } from '@xyo-network/boundwitness'
import { XyoIdWitness } from '@xyo-network/id-payload-plugin'
import { XyoNodeSystemInfoWitness } from '@xyo-network/node-system-info-payload-plugin'
import { XyoPayloadWrapper } from '@xyo-network/payload'
import { XyoWitness } from '@xyo-network/witness'
import { XyoAdhocWitness } from '@xyo-network/witnesses'

import { XyoPanel, XyoPanelConfig } from './XyoPanel'

describe('XyoPanel', () => {
  test('all [simple panel send]', async () => {
    const archivist = new XyoMemoryArchivist()

    const witnesses: XyoWitness[] = [new XyoIdWitness({ salt: 'test' }), new XyoNodeSystemInfoWitness()]

    const config: XyoPanelConfig = { witnesses }

    const panel = new XyoPanel(config, archivist)
    const adhocWitness = new XyoAdhocWitness({
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
    })

    const adhocObserved = await adhocWitness.observe()

    expect(adhocObserved).toBeDefined()

    const report1 = await panel.report([adhocWitness])
    expect(report1.schema).toBe(XyoBoundWitnessSchema)
    expect(report1.payload_hashes.length).toBe(3)
    const report2 = await panel.report()
    expect(report2.schema).toBeDefined()
    expect(report2.payload_hashes.length).toBe(2)

    expect(new XyoPayloadWrapper(report2).hash !== new XyoPayloadWrapper(report1).hash).toBe(true)
  })
})
