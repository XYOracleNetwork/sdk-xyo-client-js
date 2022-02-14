/**
 * @jest-environment jsdom
 */

import { XyoAddress } from '../Address'
import { XyoArchivistApi, XyoArchivistApiConfig } from '../ArchivistApi'
import { XyoSystemInfoWitnessBrowser } from '../WitnessesNode'
import { XyoPanel } from './XyoPanel'

test('all [simple panel send]', async () => {
  const archivistConfigs: XyoArchivistApiConfig[] = [
    {
      apiDomain: process.env.API_DOMAIN || 'https://api.archivist.xyo.network',
      archive: 'test',
    },
  ]

  const archivists = archivistConfigs.map((config) => {
    return XyoArchivistApi.get(config)
  })
  const witnesses = [new XyoSystemInfoWitnessBrowser()]

  const panel = new XyoPanel({ address: XyoAddress.fromPhrase('test'), archivists, witnesses })
  const report1 = await panel.report()
  expect(report1._hash).toBe('ca8cae5096a895799a257ab3bf6cf0cef9af2babbd61d1aedea8a18fe82b9216')
  const report2 = await panel.report()
  expect(report2._hash !== report1._hash).toBe(true)
})
