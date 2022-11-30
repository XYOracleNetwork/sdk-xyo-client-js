import { XyoApiConfig } from '@xyo-network/api-models'

import { XyoArchivistApi } from '../../Api'
import { SchemaStatsApiDiviner } from './SchemaStatsApiDiviner'
import { XyoSchemaStatsApiDivinerConfigSchema } from './SchemaStatsApiDivinerConfig'

const configData: XyoApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'http://locahost:8080',
}

test('SchemaStatsApiDiviner', async () => {
  const api = new XyoArchivistApi(configData)
  const diviner = await SchemaStatsApiDiviner.create({
    api,
    config: { archive: 'temp', schema: XyoSchemaStatsApiDivinerConfigSchema },
    logger: console,
  })

  expect(diviner).toBeDefined()

  const result = await diviner.divine()

  expect(result.length).toBeGreaterThan(0)
})
