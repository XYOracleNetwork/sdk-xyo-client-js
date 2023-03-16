import { Account } from '@xyo-network/account'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { XyoBoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { AddressHistoryQueryPayload, AddressHistoryQuerySchema, XyoArchivistPayloadDivinerConfigSchema } from '@xyo-network/diviner'
import { XyoBoundWitnessWithMeta, XyoBoundWitnessWithPartialMeta } from '@xyo-network/node-core-model'
import { XyoPayloadBuilder } from '@xyo-network/payload-builder'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { mock } from 'jest-mock-extended'

import { COLLECTIONS } from '../../../collections'
import { MongoDBAddressHistoryDiviner } from '../MongoDBAddressHistoryDiviner'

describe('MongoDBAddressHistoryDiviner', () => {
  const phrase = 'temp'
  const account = new Account({ phrase })
  const address = account.addressValue.hex
  const logger = mock<Console>()
  const boundWitnessSdk = new BaseMongoSdk<XyoBoundWitnessWithMeta>({
    collection: COLLECTIONS.BoundWitnesses,
    dbConnectionString: process.env.MONGO_CONNECTION_STRING,
  })
  let sut: MongoDBAddressHistoryDiviner
  beforeAll(async () => {
    sut = await MongoDBAddressHistoryDiviner.create({
      boundWitnessSdk,
      config: { schema: XyoArchivistPayloadDivinerConfigSchema },
      logger,
    })
    // TODO: Insert via archivist
    const payload = new XyoPayloadBuilder({ schema: 'network.xyo.test' }).build()
    const bw = new BoundWitnessBuilder().payload(payload).witness(account).build()[0]
    await boundWitnessSdk.insertOne(bw as unknown as XyoBoundWitnessWithMeta)
  })
  describe('divine', () => {
    describe('with valid query', () => {
      it('divines', async () => {
        const query: AddressHistoryQueryPayload = { address, limit: 1, schema: AddressHistoryQuerySchema }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(1)
        const actual = result[0] as XyoBoundWitnessWithPartialMeta
        expect(actual).toBeObject()
        expect(actual.schema).toBe(XyoBoundWitnessSchema)
      })
    })
  })
})
