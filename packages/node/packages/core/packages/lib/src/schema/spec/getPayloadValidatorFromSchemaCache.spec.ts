import { Payload } from '@xyo-network/payload-model'
import { SchemaCache, SchemaCacheEntry } from '@xyo-network/schema-cache'

import { getPayloadValidatorFromSchemaCache } from '../getPayloadValidatorFromSchemaCache'

const getPayload = (): Payload => {
  return {
    schema: 'network.xyo.test',
  }
}

describe('getPayloadValidatorFromSchemaCache', () => {
  describe('when validator exists', () => {
    let mock: jest.SpyInstance
    beforeAll(() => {
      const name = 'foo'
      const schema = 'network.xyo.schema'
      const definition = { $schema: 'http://json-schema.org/draft-07/schema#' }
      mock = jest.spyOn(SchemaCache.prototype, 'get').mockImplementation((_schema?: string) => {
        const entry: SchemaCacheEntry = { payload: { definition, name, schema } }
        return Promise.resolve(entry)
      })
    })
    afterAll(() => {
      mock?.mockClear()
    })
    it('returns the validator', async () => {
      const payload = getPayload()
      const validator = await getPayloadValidatorFromSchemaCache(payload)
      expect(validator).toBeTruthy()
    })
  })
  describe('when validator does not exist', () => {
    let mock: jest.SpyInstance
    beforeAll(() => {
      mock = jest.spyOn(SchemaCache.prototype, 'get').mockImplementation((_schema?: string) => {
        return Promise.resolve(undefined)
      })
    })
    afterAll(() => {
      mock?.mockClear()
    })
    it('returns undefined', async () => {
      const payload = getPayload()
      const validator = await getPayloadValidatorFromSchemaCache(payload)
      expect(validator).toBeUndefined()
    })
  })
  describe('when there is an error obtaining validator', () => {
    let mock: jest.SpyInstance
    beforeAll(() => {
      mock = jest.spyOn(SchemaCache.prototype, 'get').mockResolvedValue(null)
    })
    afterAll(() => {
      mock?.mockClear()
    })
    it('returns undefined', async () => {
      const payload = getPayload()
      const validator = await getPayloadValidatorFromSchemaCache(payload)
      expect(validator).toBeUndefined()
    })
  })
})
