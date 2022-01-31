/**
 * @jest-environment jsdom
 */

import { XyoArchivistApi, XyoArchivistApiConfig } from '../ArchivistApi'
import { XyoAddress } from '../Address'
import { XyoSystemInfoWitness } from '../Witnesses/SystemInfo'
import { XyoPanel } from './XyoPanel'

test('all [simple panel send]', async () => {
  const archivistConfigs: XyoArchivistApiConfig[] = [{
    apiDomain: process.env.API_DOMAIN || 'https://api.archivist.xyo.network',
    archive: 'test',
  }]

  const archivists = archivistConfigs.map((config) => { return XyoArchivistApi.get(config) })
  const witnesses = [new XyoSystemInfoWitness()]
  
  const panel = new XyoPanel({address: XyoAddress.fromPhrase('test'), archivists, witnesses})
  await panel.report()
  expect(1).toBe(1)
})