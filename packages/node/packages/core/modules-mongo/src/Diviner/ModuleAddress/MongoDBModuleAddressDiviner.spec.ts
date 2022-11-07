import { XyoAccount } from '@xyo-network/account'
import {
  ArchiveArchivist,
  ModuleAddressPayload,
  ModuleAddressQueryPayload,
  ModuleAddressQuerySchema,
  ModuleAddressSchema,
  XyoBoundWitnessWithMeta,
  XyoPayloadWithMeta,
} from '@xyo-network/node-core-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { Logger } from '@xyo-network/shared'
import { mock, MockProxy } from 'jest-mock-extended'

import { COLLECTIONS } from '../../collections'
import { getBaseMongoSdk } from '../../Mongo'
import { MongoDBModuleAddressDiviner } from './MongoDBModuleAddressDiviner'

describe('MongoDBModuleAddressDiviner', () => {
  let logger: MockProxy<Logger>
  let account: XyoAccount
  let payloads: BaseMongoSdk<XyoPayloadWithMeta>
  let boundWitnesses: BaseMongoSdk<XyoBoundWitnessWithMeta>
  let archiveArchivist: MockProxy<ArchiveArchivist>
  let sut: MongoDBModuleAddressDiviner
  beforeEach(() => {
    logger = mock<Logger>()
    account = XyoAccount.random()
    archiveArchivist = mock<ArchiveArchivist>()
    payloads = getBaseMongoSdk<XyoPayloadWithMeta>(COLLECTIONS.Payloads)
    boundWitnesses = getBaseMongoSdk<XyoBoundWitnessWithMeta>(COLLECTIONS.BoundWitnesses)
    sut = new MongoDBModuleAddressDiviner(logger, account, archiveArchivist, boundWitnesses, payloads)
  })
  describe('divine', () => {
    describe('with valid query', () => {
      it('divines', async () => {
        const query: ModuleAddressQueryPayload = { schema: ModuleAddressQuerySchema }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(1)
        const actual = result[0] as ModuleAddressPayload
        expect(actual).toBeObject()
        expect(actual.schema).toBe(ModuleAddressSchema)
      })
    })
  })
})
