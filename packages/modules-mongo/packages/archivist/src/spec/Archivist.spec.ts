/* eslint-disable max-statements */
let timestamp = 123456789000
Date.now = jest.fn(() => timestamp)

import { describeIf } from '@xylabs/jest-helpers'
import { Account } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { toUint8Array } from '@xyo-network/core'
import { COLLECTIONS, hasMongoDBConfig } from '@xyo-network/module-abstract-mongodb'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper, PayloadWrapperBase } from '@xyo-network/payload-wrapper'
import { BaseMongoSdkConfig } from '@xyo-network/sdk-xyo-mongo-js'

import { MongoDBArchivist } from '../Archivist'

describeIf(hasMongoDBConfig())('DeterministicArchivist', () => {
  const boundWitnessesConfig: BaseMongoSdkConfig = { collection: COLLECTIONS.BoundWitnesses }
  const payloadsConfig: BaseMongoSdkConfig = { collection: COLLECTIONS.Payloads }
  let archiveAccount: AccountInstance
  let userAccount: AccountInstance
  let moduleAccount: AccountInstance
  let randomAccount: AccountInstance

  const payloadWrappers: PayloadWrapper[] = []
  const boundWitnessWrappers: BoundWitnessWrapper[] = []
  let archivist: ArchivistWrapper
  let insertResult1: Payload[]
  // let insertResult2: BoundWitness[]
  let insertResult3: Payload[]
  const insertResults: Payload[][] = []
  beforeAll(async () => {
    archiveAccount = await Account.create({ phrase: 'surface assault spice bulk sun hire hold rebuild cook arm winter vote' })

    // 0x10ca1959336ea208bcdf00dd6d6637aec91a4c0e
    userAccount = await Account.create({ privateKey: toUint8Array('69f0b123c094c34191f22c25426036d6e46d5e1fab0a04a164b3c1c2621152ab') })

    // 0xdaddab0e0468c920bd5aff4b14fd94c20a598055
    moduleAccount = await Account.create({ privateKey: toUint8Array('9c9637dc07ce9956190c028677f5195a8fb425e9927bf2e48fe39a1c55cf050a') })

    // 0xbabe1d55e51844ea1cdc6b4dcbb649bb08e3cc3c
    randomAccount = await Account.create({ privateKey: toUint8Array('3c17e038c8daeed7dfab9b9653321523d5f1a68eadfc5e4bd501075a5e43bbcc') })

    jest.spyOn(Account, 'randomSync').mockImplementation(() => randomAccount as Account)

    boundWitnessesConfig.dbConnectionString = process.env.MONGO_CONNECTION_STRING
    payloadsConfig.dbConnectionString = process.env.MONGO_CONNECTION_STRING

    const module = await MongoDBArchivist.create({
      account: moduleAccount,
      boundWitnessSdkConfig: boundWitnessesConfig,
      config: { schema: MongoDBArchivist.configSchema },
      payloadSdkConfig: payloadsConfig,
    })
    expect(module.address).toBe(moduleAccount.address)
    expect(module.address).toBe('daddab0e0468c920bd5aff4b14fd94c20a598055')
    archivist = ArchivistWrapper.wrap(module, archiveAccount)
    const payload1 = { nonce: 1, schema: 'network.xyo.debug' }
    const payload2 = { nonce: 2, schema: 'network.xyo.test' }
    const payload3 = { nonce: 3, schema: 'network.xyo.debug' }
    const payload4 = { nonce: 4, schema: 'network.xyo.test' }
    const payloadWrapper1 = PayloadWrapper.wrap(payload1)
    const payloadWrapper2 = PayloadWrapper.wrap(payload2)
    const payloadWrapper3 = PayloadWrapper.wrap(payload3)
    const payloadWrapper4 = PayloadWrapper.wrap(payload4)
    payloadWrappers.push(payloadWrapper1, payloadWrapper2, payloadWrapper3, payloadWrapper4)
    const boundWitness1 = (await new BoundWitnessBuilder().payload(payloadWrapper1.payload()).witness(userAccount).build())[0]
    const boundWitness2 = (await new BoundWitnessBuilder().payload(payloadWrapper2.payload()).witness(userAccount).build())[0]
    const boundWitness3 = (
      await new BoundWitnessBuilder().payloads([payloadWrapper3.payload(), payloadWrapper4.payload()]).witness(userAccount).build()
    )[0]
    const boundWitnessWrapper1 = BoundWitnessWrapper.parse(boundWitness1, [payload1])
    const boundWitnessWrapper2 = BoundWitnessWrapper.parse(boundWitness2, [payload2])
    const boundWitnessWrapper3 = BoundWitnessWrapper.parse(boundWitness3, [payload3, payload4])

    boundWitnessWrappers.push(boundWitnessWrapper1, boundWitnessWrapper2, boundWitnessWrapper3)
    const insertions = [
      // TODO: Try simple cases of [payload, BW, mixed BW & Payload]
      [boundWitness1, payload1],
      [boundWitness2, payload2],
      [boundWitness3, payload3, payload4],
    ]
    insertResults.push(
      ...(await Promise.all(
        insertions.map(async (insertion) => {
          const result = await archivist.insert(insertion)
          // NOTE: Increment Date.now after each insert so that DB sorting by time works
          timestamp++
          return result
        }),
      )),
    )

    insertResult1 = insertResults[0]
    // insertResult2 = insertResults[1]
    insertResult3 = insertResults[2]
  })
  describe('discover', () => {
    it('discovers module', async () => {
      const result = await archivist.discover()
      expect(result).toBeArray()
      expect(result.length).toBeGreaterThan(0)
    })
  })
  describe('insert', () => {
    it('inserts single payload', () => {
      expect(insertResult1).toBeTruthy()
      expect(insertResult1).toBeArrayOfSize(2)
      /*
      const [boundResult] = insertResult1
      expect(boundResult.addresses).toContain(archivist.address)
      expect(boundResult.addresses).toContain(moduleAccount.public.address.hex)
      const boundWitnessWrapper = boundWitnessWrappers[0]
      expect(boundResult.payload_hashes).toBeArrayOfSize(boundWitnessWrapper.payloadsArray.length + 3)
      await Promise.all(
        boundWitnessWrapper.payloadsArray.map(async (p) => {
          expect(boundResult.payload_hashes).toInclude(await p.hashAsync())
        }),
      )
      expect(insertResult1.map((bw) => BoundWitnessWrapper.parse(bw).boundwitness)).toMatchSnapshot()
      */
    })
    it('inserts multiple payloads', () => {
      expect(insertResult3).toBeTruthy()
      expect(insertResult3).toBeArrayOfSize(3)
      /*const [boundResult, transactionResults] = insertResult3
      expect(boundResult.addresses).toContain(archivist.address)
      expect(transactionResults.addresses).toContain(moduleAccount.public.address.hex)
      const boundWitnessWrapper = boundWitnessWrappers[2]
      expect(transactionResults.payload_hashes).toBeArrayOfSize(boundWitnessWrapper.payloadsArray.length + 3)
      await Promise.all(
        boundWitnessWrapper.payloadsArray.map(async (p) => {
          expect(transactionResults.payload_hashes).toInclude(await p.hashAsync())
        }),
      )
      expect(insertResult3.map((bw) => BoundWitnessWrapper.parse(bw).boundwitness)).toMatchSnapshot()
      */
    })
  })
  describe('get', () => {
    type TestDataGetter<T> = () => T
    const cases: [string, TestDataGetter<PayloadWrapperBase[]>][] = [
      ['gets single payload', () => [payloadWrappers[0]]],
      ['gets multiple payloads', () => [payloadWrappers[0], payloadWrappers[1], payloadWrappers[2]]],
      ['gets single boundwitness', () => [boundWitnessWrappers[0]]],
      ['gets multiple boundwitness', () => [boundWitnessWrappers[0], boundWitnessWrappers[1], boundWitnessWrappers[2]]],
    ]
    it.each(cases)('%s', async (_title, getData) => {
      const payloads = getData()
      const results = await archivist.get(payloads.map((p) => p.hashSync()))
      expect(results).toBeTruthy()
      expect(results).toBeArrayOfSize(payloads.length)
      const resultPayloads = results.map((result) => PayloadWrapper.wrap(result as Payload))
      const resultHashes = await Promise.all(resultPayloads.map((p) => p.hashAsync()))
      payloads.map((p) => {
        expect(resultHashes).toInclude(p.hashSync())
      })
      expect(results).toMatchSnapshot()
    })
  })
})
