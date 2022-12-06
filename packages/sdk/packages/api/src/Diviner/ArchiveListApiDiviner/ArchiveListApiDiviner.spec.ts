import { XyoApiConfig } from '@xyo-network/api-models'

import { XyoArchivistApi } from '../../Api'
import { ArchiveListApiDiviner } from './ArchiveListApiDiviner'
import { XyoArchiveListApiDivinerConfigSchema, XyoArchiveSchema } from './ArchiveListApiDivinerConfig'

const configData: XyoApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'http://locahost:8080',
}

test('ArchiveListApiDiviner', async () => {
  const api = new XyoArchivistApi(configData)
  const diviner = await ArchiveListApiDiviner.create({ api, config: { schema: XyoArchiveListApiDivinerConfigSchema } })
  expect(diviner).toBeDefined()
  const result = await diviner.divine()
  expect(result.length).toBeGreaterThan(0)
  expect(result[0].schema).toBe(XyoArchiveSchema)
})
