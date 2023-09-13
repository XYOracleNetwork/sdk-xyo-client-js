import { describeIf } from '@xylabs/jest-helpers'
import { Account, HDWallet } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { BoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { AddressHistoryDivinerConfigSchema, AddressHistoryQueryPayload, AddressHistoryQuerySchema } from '@xyo-network/diviner-address-history'
import { BoundWitnessWithMeta, BoundWitnessWithPartialMeta } from '@xyo-network/node-core-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { mock } from 'jest-mock-extended'

import { canAddMongoModules } from '../../../canAddMongoModules'
import { COLLECTIONS } from '../../../collections'
import { MongoDBAddressHistoryDiviner } from '../MongoDBAddressHistoryDiviner'

describeIf(canAddMongoModules())('MongoDBAddressHistoryDiviner', () => {
  const phrase = 'temp'
  let account: AccountInstance
  let address: string
  const logger = mock<Console>()
  const boundWitnessSdk = new BaseMongoSdk<BoundWitnessWithMeta>({
    collection: COLLECTIONS.BoundWitnesses,
    dbConnectionString: process.env.MONGO_CONNECTION_STRING,
  })
  let sut: MongoDBAddressHistoryDiviner
  beforeAll(async () => {
    account = await Account.create({ phrase })
    address = account.address
    sut = await MongoDBAddressHistoryDiviner.create({
      account: await HDWallet.random(),
      boundWitnessSdk,
      config: { schema: AddressHistoryDivinerConfigSchema },
      logger,
    })
    // TODO: Insert via archivist
    const payload = await new PayloadBuilder({ schema: 'network.xyo.test' }).build()
    const bw = (await new BoundWitnessBuilder().payload(payload).witness(account).build())[0]
    await boundWitnessSdk.insertOne(bw as unknown as BoundWitnessWithMeta)
  })
  describe('divine', () => {
    describe('with valid query', () => {
      it('divines', async () => {
        const query: AddressHistoryQueryPayload = { address, limit: 1, schema: AddressHistoryQuerySchema }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(1)
        const actual = result[0] as BoundWitnessWithPartialMeta
        expect(actual).toBeObject()
        expect(actual.schema).toBe(BoundWitnessSchema)
      })
    })
  })
})
