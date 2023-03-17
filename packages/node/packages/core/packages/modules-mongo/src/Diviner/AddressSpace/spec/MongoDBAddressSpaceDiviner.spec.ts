import { Account } from '@xyo-network/account'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { AddressSpaceQueryPayload, AddressSpaceQuerySchema, XyoArchivistPayloadDivinerConfigSchema } from '@xyo-network/diviner'
import { XyoBoundWitnessWithMeta } from '@xyo-network/node-core-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { mock } from 'jest-mock-extended'

import { COLLECTIONS } from '../../../collections'
import { MongoDBAddressSpaceDiviner } from '../MongoDBAddressSpaceDiviner'

describe('MongoDBAddressSpaceDiviner', () => {
  const phrase = 'temp'
  const account = new Account({ phrase })
  const address = account.addressValue.hex
  const logger = mock<Console>()
  const boundWitnessSdk = new BaseMongoSdk<XyoBoundWitnessWithMeta>({
    collection: COLLECTIONS.BoundWitnesses,
    dbConnectionString: process.env.MONGO_CONNECTION_STRING,
  })
  let sut: MongoDBAddressSpaceDiviner
  beforeAll(async () => {
    sut = await MongoDBAddressSpaceDiviner.create({
      account,
      boundWitnessSdk,
      config: { schema: XyoArchivistPayloadDivinerConfigSchema },
      logger,
    })
    // TODO: Insert via archivist
    const payload = new PayloadBuilder({ schema: 'network.xyo.test' }).build()
    const bw = new BoundWitnessBuilder().payload(payload).witness(account).build()[0]
    await boundWitnessSdk.insertOne(bw as unknown as XyoBoundWitnessWithMeta)
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
