import { XyoArchivistPayloadDivinerConfigSchema } from '@xyo-network/diviner'
import { PayloadQueryPayload, PayloadQuerySchema, XyoBoundWitnessWithPartialMeta } from '@xyo-network/node-core-model'

import { MongoDBPayloadDiviner } from './MongoDBPayloadDiviner'

describe('MongoDBPayloadDiviner', () => {
  let sut: MongoDBPayloadDiviner
  beforeEach(async () => {
    sut = await MongoDBPayloadDiviner.create({ config: { schema: XyoArchivistPayloadDivinerConfigSchema } })
  })
  describe('divine', () => {
    describe('with valid query', () => {
      it('divines', async () => {
        const query: PayloadQueryPayload = { limit: 1, schema: PayloadQuerySchema }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(1)
        const actual = result[0] as XyoBoundWitnessWithPartialMeta
        expect(actual).toBeObject()
        expect(actual.schema).toBeDefined()
        expect(actual.schema).toBeString()
      })
    })
  })
})
