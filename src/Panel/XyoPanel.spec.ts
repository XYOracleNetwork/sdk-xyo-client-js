/**
 * @jest-environment jsdom
 */

import { XyoAddress } from '../Address'
import { XyoArchivistApi, XyoArchivistApiConfig } from '../ArchivistApi'
import { XyoSystemInfoWitness } from '../Witnesses'
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
  const witnesses = [new XyoSystemInfoWitness()]

  const panel = new XyoPanel({ address: XyoAddress.fromPhrase('test'), archivists, witnesses })
  const report1 = await panel.report()
  expect(report1._hash).toBe('ae22e6abff4ee3b1cd44df8121bb1a783c46159529c040558b21eca8c3eb61ac')
  const report2 = await panel.report()
  expect(report2._hash !== report1._hash).toBe(true)
})
