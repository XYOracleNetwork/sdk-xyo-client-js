import { describeIf } from '@xylabs/jest-helpers'
import { Account } from '@xyo-network/account'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { AddressSpaceDivinerConfigSchema } from '@xyo-network/diviner-address-space-model'
import { BoundWitnessWithMeta } from '@xyo-network/node-core-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { mock } from 'jest-mock-extended'

import { canAddMongoModules } from '../../../canAddMongoModules'
import { COLLECTIONS } from '../../../collections'
import { MongoDBAddressSpaceDiviner } from '../MongoDBAddressSpaceDiviner'

describeIf(canAddMongoModules())('MongoDBAddressSpaceDiviner', () => {
  const phrase = 'temp'
  const account = new Account({ phrase })
  const logger = mock<Console>()
  const boundWitnessSdk = new BaseMongoSdk<BoundWitnessWithMeta>({
    collection: COLLECTIONS.BoundWitnesses,
    dbConnectionString: process.env.MONGO_CONNECTION_STRING,
  })
  let sut: MongoDBAddressSpaceDiviner
  beforeAll(async () => {
    sut = await MongoDBAddressSpaceDiviner.create({
      account,
      boundWitnessSdk,
      config: { schema: AddressSpaceDivinerConfigSchema },
      logger,
    })
    // TODO: Insert via archivist
    const payload = new PayloadBuilder({ schema: 'network.xyo.test' }).build()
    const bw = (await new BoundWitnessBuilder().payload(payload).witness(account).build())[0]
    await boundWitnessSdk.insertOne(bw as unknown as BoundWitnessWithMeta)
  })
  describe('divine', () => {
    describe('with valid query', () => {
      it('divines', async () => {
        const result = await sut.divine([])
        expect(result).toBeArray()
        expect(result.length).toBeGreaterThan(0)
        result.map((address) => {
          const payload = PayloadWrapper.wrap<AddressPayload>(address as AddressPayload)
          expect(payload.schema()).toBe(AddressSchema)
          expect(payload.payload().address).toBeString()
        })
      })
    })
  })
})
