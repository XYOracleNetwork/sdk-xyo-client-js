import { XyoAccount } from '@xyo-network/account'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness'
import { XyoSchemaPayload, XyoSchemaSchema } from '@xyo-network/schema-payload-plugin'

import { XyoApiConfig } from '../../../models'
import { XyoArchivistApi } from '../../Api'
import { getNewArchive, getSchemaName } from '../../ApiUtil.spec'

const config: XyoApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'http://localhost:8080',
}

const payload: XyoSchemaPayload = {
  definition: {
    $id: '',
    $schema: 'http://json-schema.org/draft-07/schema#',
    schema: getSchemaName(),
  },
  schema: XyoSchemaSchema,
}

describe('XyoArchivistArchiveSchemaApi', () => {
  const api = new XyoArchivistApi(config)
  let archive = ''
  beforeAll(async () => {
    archive = await getNewArchive(api)
    const [boundWitness] = new BoundWitnessBuilder({ inlinePayloads: true }).witness(XyoAccount.random()).payload(payload).build()
    await api.archives.archive(archive).block.post([boundWitness])
  })
  describe('get', () => {
    it('calculates the correct path', () => {
      const api = new XyoArchivistApi(config)
      const path = api.archive(archive).payload.schema.config.root
      expect(path).toBe(`/archive/${archive}/payload/schema/`)
    })
    it('lists the schema in the archive', async () => {
      const api = new XyoArchivistApi(config)
      const response = await api.archive(archive).payload.schema.get()
      expect(response).toBeTruthy()
      expect(Array.isArray(response)).toBe(true)
      expect(response?.length).toBe(1)
      expect(response?.[0]).toBe(payload.schema)
    })
  })
  describe('stats', () => {
    it('calculates the correct path', () => {
      const api = new XyoArchivistApi(config)
      const path = api.archive(archive).payload.schema.stats.config.root
      expect(path).toBe(`/archive/${archive}/payload/schema/stats/`)
    })
    it('lists the stats for the payloads by schema in the archive', async () => {
      const api = new XyoArchivistApi(config)
      const response = await api.archive(archive).payload.schema.stats.get()
      expect(response).toBeTruthy()
      expect(response?.counts).toBeTruthy()
      const schemas = Object.keys(response?.counts || {})
      expect(schemas.length).toBe(1)
      expect(schemas?.[0]).toBe(payload.schema)
      expect(response?.counts[payload.schema]).toBe(1)
    })
  })
})
