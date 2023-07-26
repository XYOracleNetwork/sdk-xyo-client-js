import { describeIf } from '@xylabs/jest-helpers'
import { Account, HDWallet } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import {
  SchemaListDivinerConfigSchema,
  SchemaListDivinerSchema,
  SchemaListPayload,
  SchemaListQueryPayload,
  SchemaListQuerySchema,
} from '@xyo-network/diviner-schema-list-model'
import { BoundWitnessWithMeta } from '@xyo-network/node-core-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { mock } from 'jest-mock-extended'

import { canAddMongoModules } from '../../../canAddMongoModules'
import { COLLECTIONS } from '../../../collections'
import { MongoDBSchemaListDiviner } from '../MongoDBSchemaListDiviner'

describeIf(canAddMongoModules())('MongoDBSchemaListDiviner', () => {
  let account: AccountInstance
  let address: string
  const phrase = 'temp'
  const logger = mock<Console>()
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = new BaseMongoSdk<BoundWitnessWithMeta>({
    collection: COLLECTIONS.BoundWitnesses,
    dbConnectionString: process.env.MONGO_CONNECTION_STRING,
  })
  let sut: MongoDBSchemaListDiviner
  beforeAll(async () => {
    account = await Account.create({ phrase })
    address = account.address
    sut = await MongoDBSchemaListDiviner.create({
      account: await HDWallet.random(),
      boundWitnessSdk,
      config: { schema: SchemaListDivinerConfigSchema },
      logger,
    })
    // TODO: Insert via archivist
    const payload = new PayloadBuilder({ schema: 'network.xyo.test' }).build()
    const bw = (await new BoundWitnessBuilder().payload(payload).witness(account).build())[0]
    await boundWitnessSdk.insertOne(bw as unknown as BoundWitnessWithMeta)
  })
  describe('divine', () => {
    describe('with address supplied in query', () => {
      it('divines results for the address', async () => {
        const query: SchemaListQueryPayload = { address, schema: SchemaListQuerySchema }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(1)
        const actual = result[0] as SchemaListPayload
        expect(actual).toBeObject()
        expect(actual.schema).toBe(SchemaListDivinerSchema)
        expect(actual.schemas).toBeArray()
        actual.schemas.map((schema) => {
          expect(schema).toBeString()
        })
      })
    })
    describe('with no address supplied in query', () => {
      it('divines results for all addresses', async () => {
        const query: SchemaListQueryPayload = { schema: SchemaListQuerySchema }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(1)
        const actual = result[0] as SchemaListPayload
        expect(actual).toBeObject()
        expect(actual.schema).toBe(SchemaListDivinerSchema)
        expect(actual.schemas).toBeArray()
        actual.schemas.map((schema) => {
          expect(schema).toBeString()
        })
      })
    })
  })
})
