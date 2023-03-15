import { XyoBoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { XyoArchivistPayloadDivinerConfigSchema } from '@xyo-network/diviner'
import { BoundWitnessQueryPayload, BoundWitnessQuerySchema, XyoBoundWitnessWithPartialMeta } from '@xyo-network/node-core-model'
import { mock } from 'jest-mock-extended'

import { MongoDBBoundWitnessDiviner } from '../MongoDBBoundWitnessDiviner'

describe('MongoDBBoundWitnessDiviner', () => {
  const logger = mock<Console>()
  let sut: MongoDBBoundWitnessDiviner
  beforeAll(async () => {
    sut = await MongoDBBoundWitnessDiviner.create({
      config: { schema: XyoArchivistPayloadDivinerConfigSchema },
      logger,
    })
  })
  describe('divine', () => {
    describe('with valid query', () => {
      it('divines', async () => {
        const query: BoundWitnessQueryPayload = { limit: 1, schema: BoundWitnessQuerySchema }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(1)
        const actual = result[0] as XyoBoundWitnessWithPartialMeta
        expect(actual).toBeObject()
        expect(actual.schema).toBe(XyoBoundWitnessSchema)
      })
    })
  })
})
