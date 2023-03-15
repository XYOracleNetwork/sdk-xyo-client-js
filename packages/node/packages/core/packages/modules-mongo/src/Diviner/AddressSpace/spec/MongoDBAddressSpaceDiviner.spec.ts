import { Account } from '@xyo-network/account'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { AddressSpaceQueryPayload, AddressSpaceQuerySchema, XyoArchivistPayloadDivinerConfigSchema } from '@xyo-network/diviner'
import { XyoBoundWitnessMeta, XyoBoundWitnessWithMeta, XyoPayloadWithMeta } from '@xyo-network/node-core-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { mock } from 'jest-mock-extended'

import { COLLECTIONS } from '../../../collections'
import { MongoDBAddressSpaceDiviner } from '../MongoDBAddressSpaceDiviner'

describe('MongoDBAddressSpaceDiviner', () => {
  const phrase = 'temp'
  const address = new Account({ phrase }).addressValue.hex
  const logger = mock<Console>()
  const boundWitnessSdk = new BaseMongoSdk<XyoBoundWitnessWithMeta>({
    collection: COLLECTIONS.BoundWitnesses,
    dbConnectionString: process.env.MONGO_CONNECTION_STRING,
  })
  let sut: MongoDBAddressSpaceDiviner
  beforeAll(async () => {
    sut = await MongoDBAddressSpaceDiviner.create({
      boundWitnessSdk,
      config: { schema: XyoArchivistPayloadDivinerConfigSchema },
      logger,
    })
  })
  describe('divine', () => {
    describe('with valid query', () => {
      it('divines', async () => {
        const query: AddressSpaceQueryPayload = { address, limit: 1, schema: AddressSpaceQuerySchema }
        const result = await sut.divine([query])
        expect(result).toBeArray()
        expect(result.length).toBeGreaterThan(0)
        result.map((address) => {
          const payload = PayloadWrapper.parse<AddressPayload>(address)
          expect(payload.schema).toBe(AddressSchema)
          expect(payload.payload.address).toBeString()
        })
      })
    })
  })
})
