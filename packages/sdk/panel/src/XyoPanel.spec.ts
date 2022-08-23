import { XyoAccount } from '@xyo-network/account'
import { XyoApiConfig, XyoArchivistApi } from '@xyo-network/api'
import { XyoIdPayloadSchema, XyoIdWitness, XyoIdWitnessConfigSchema } from '@xyo-network/id-payload-plugin'
import {
  XyoNodeSystemInfoPayloadSchema,
  XyoNodeSystemInfoWitness,
  XyoNodeSystemInfoWitnessConfig,
  XyoNodeSystemInfoWitnessConfigSchema,
} from '@xyo-network/node-system-info-payload-plugin'
import { XyoWitness } from '@xyo-network/witness'
import { XyoAdhocWitness } from '@xyo-network/witnesses'

import { XyoPanel, XyoPanelConfig } from './XyoPanel'

describe('XyoPanel', () => {
  test('all [simple panel send]', async () => {
    const archivistConfigs: XyoApiConfig[] = [
      {
        apiDomain: process.env.API_DOMAIN || 'https://beta.api.archivist.xyo.network',
      },
    ]

    const archivists = archivistConfigs.map((config) => {
      return new XyoArchivistApi(config)
    })

    const systemInfoNodeWitnessConfig: XyoNodeSystemInfoWitnessConfig = {
      account: new XyoAccount(),
      schema: XyoNodeSystemInfoWitnessConfigSchema,
      targetSchema: XyoNodeSystemInfoPayloadSchema,
    }

    const witnesses: XyoWitness[] = [
      new XyoIdWitness({ account: new XyoAccount(), schema: XyoIdWitnessConfigSchema, targetSchema: XyoIdPayloadSchema }),
      new XyoNodeSystemInfoWitness(systemInfoNodeWitnessConfig),
    ]

    const config: XyoPanelConfig = { account: new XyoAccount(), archivists, witnesses }

    const panel = new XyoPanel(config)
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
    expect(report1._hash).toBeDefined()
    const report2 = await panel.report()
    expect(report2._hash).toBeDefined()

    expect(report2._hash !== report1._hash).toBe(true)
  })
})
