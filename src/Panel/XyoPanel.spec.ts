import { XyoAddress } from '../Address'
import { XyoArchivistApi, XyoArchivistApiConfig } from '../Api'
import { XyoAdhocWitness, XyoSystemInfoWitness } from '../Witnesses'
import { XyoPanel, XyoPanelConfig } from './XyoPanel'

test('all [simple panel send]', async () => {
  const archivistConfigs: XyoArchivistApiConfig[] = [
    {
      apiDomain: process.env.API_DOMAIN || 'https://beta.api.archivist.xyo.network',
      archive: 'temp',
    },
  ]

  const archivists = archivistConfigs.map((config) => {
    return new XyoArchivistApi(config)
  })
  const witnesses = [new XyoSystemInfoWitness()]

  const config: XyoPanelConfig = { address: new XyoAddress(), archivists, witnesses }

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

  const report1 = await panel.report([adhocWitness])
  const report2 = await panel.report()

  expect(report2._hash !== report1._hash).toBe(true)
})
