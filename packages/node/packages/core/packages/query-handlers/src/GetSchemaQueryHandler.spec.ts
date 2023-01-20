import { GetSchemaQuery, GetSchemaSchema } from '@xyo-network/node-core-model'
import { XyoSchemaCache } from '@xyo-network/utils'

import { GetSchemaQueryHandler } from './GetSchemaQueryHandler'

const schema = GetSchemaSchema

describe('GetSchemaQueryHandler', () => {
  describe('with valid schema', () => {
    it('returns the schema config', async () => {
      const name = 'network.xyo.schema'
      const sut = new GetSchemaQueryHandler(XyoSchemaCache.instance)
      const actual = await sut.handle(new GetSchemaQuery({ name, schema }))
      expect(actual).toBeTruthy()
      expect(actual?.schema).toBe(name)
      expect(actual?.definition).toBeTruthy()
    })
  })
  describe('with non-existent schema', () => {
    it('returns undefined', async () => {
      const name = 'network.xyo.foo'
      const sut = new GetSchemaQueryHandler(XyoSchemaCache.instance)
      const actual = await sut.handle(new GetSchemaQuery({ name, schema }))
      expect(actual).toBeUndefined()
    })
  })
})
