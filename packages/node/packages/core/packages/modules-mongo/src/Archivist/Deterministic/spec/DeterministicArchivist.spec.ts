/* eslint-disable max-statements */
let timestamp = 123456789000
Date.now = jest.fn(() => timestamp)

import { describeIf } from '@xylabs/jest-helpers'
import { Account } from '@xyo-network/account'
import { ArchivistWrapper } from '@xyo-network/archivist'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { BoundWitnessWithMeta, PayloadWithMeta } from '@xyo-network/node-core-model'
import { PayloadWrapper, PayloadWrapperBase } from '@xyo-network/payload-wrapper'
import { BaseMongoSdk, BaseMongoSdkConfig } from '@xyo-network/sdk-xyo-mongo-js'

import { canAddMongoModules } from '../../../canAddMongoModules'
import { COLLECTIONS } from '../../../collections'
import { MongoDBDeterministicArchivist } from '../DeterministicArchivist'

describeIf(canAddMongoModules())('DeterministicArchivist', () => {
  const boundWitnessesConfig: BaseMongoSdkConfig = { collection: COLLECTIONS.BoundWitnesses }
  const payloadsConfig: BaseMongoSdkConfig = { collection: COLLECTIONS.Payloads }
  const archiveAccount: Account = new Account({ phrase: 'temp' })
  // 0x10cal
  const userAccount: Account = new Account({ privateKey: '69f0b123c094c34191f22c25426036d6e46d5e1fab0a04a164b3c1c2621152ab' })
  // 0xdadda
  const moduleAccount: Account = new Account({ privateKey: '9c9637dc07ce9956190c028677f5195a8fb425e9927bf2e48fe39a1c55cf050a' })
  // 0xace
  const randomAccount: Account = new Account({ privateKey: '3c17e038c8daeed7dfab9b9653321523d5f1a68eadfc5e4bd501075a5e43bbcc' })

  const payloadWrappers: PayloadWrapper[] = []
  const boundWitnessWrappers: BoundWitnessWrapper[] = []
  let archivist: ArchivistWrapper
  let insertResult1: BoundWitness[]
  // let insertResult2: BoundWitness[]
  let insertResult3: BoundWitness[]
  const insertResults: BoundWitness[][] = []
  beforeAll(async () => {
    jest.spyOn(Account, 'random').mockImplementation(() => randomAccount)
    boundWitnessesConfig.dbConnectionString = process.env.MONGO_CONNECTION_STRING
    payloadsConfig.dbConnectionString = process.env.MONGO_CONNECTION_STRING
    const boundWitnesses: BaseMongoSdk<BoundWitnessWithMeta> = new BaseMongoSdk(boundWitnessesConfig)
    const payloads: BaseMongoSdk<PayloadWithMeta> = new BaseMongoSdk(payloadsConfig)
    const module = await MongoDBDeterministicArchivist.create({
      account: moduleAccount,
      boundWitnessSdk: boundWitnesses,
      config: { schema: MongoDBDeterministicArchivist.configSchema },
      payloadSdk: payloads,
    })
    archivist = ArchivistWrapper.wrap(module, archiveAccount)
    const payload1 = { nonce: 1, schema: 'network.xyo.debug' }
    const payload2 = { nonce: 2, schema: 'network.xyo.test' }
    const payload3 = { nonce: 3, schema: 'network.xyo.debug' }
    const payload4 = { nonce: 4, schema: 'network.xyo.test' }
    const payloadWrapper1 = PayloadWrapper.parse(payload1)
    const payloadWrapper2 = PayloadWrapper.parse(payload2)
    const payloadWrapper3 = PayloadWrapper.parse(payload3)
    const payloadWrapper4 = PayloadWrapper.parse(payload4)
    payloadWrappers.push(payloadWrapper1, payloadWrapper2, payloadWrapper3, payloadWrapper4)
    const boundWitness1 = (await new BoundWitnessBuilder().payload(payloadWrapper1.payload).witness(userAccount).build())[0]
    const boundWitness2 = (await new BoundWitnessBuilder().payload(payloadWrapper2.payload).witness(userAccount).build())[0]
    const boundWitness3 = (
      await new BoundWitnessBuilder().payloads([payloadWrapper3.payload, payloadWrapper4.payload]).witness(userAccount).build()
    )[0]
    const boundWitnessWrapper1 = BoundWitnessWrapper.parse(boundWitness1)
    const boundWitnessWrapper2 = BoundWitnessWrapper.parse(boundWitness2)
    const boundWitnessWrapper3 = BoundWitnessWrapper.parse(boundWitness3)
    boundWitnessWrapper1.payloads = [payload1]
    boundWitnessWrapper2.payloads = [payload2]
    boundWitnessWrapper3.payloads = [payload3, payload4]
    boundWitnessWrappers.push(boundWitnessWrapper1, boundWitnessWrapper2, boundWitnessWrapper3)
    const insertions = [
      // TODO: Try simple cases of [payload, BW, mixed BW & Payload]
      [boundWitness1, payload1],
      [boundWitness2, payload2],
      [boundWitness3, payload3, payload4],
    ]
    for (const insertion of insertions) {
      const insertionResult = await archivist.insert(insertion)
      insertResults.push(insertionResult)
      // NOTE: Increment Date.now after each insert so that DB sorting by time works
      timestamp++
    }
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
      const [boundResult, transactionResults] = insertResult1
      expect(boundResult.addresses).toContain(archivist.address)
      expect(transactionResults.addresses).toContain(moduleAccount.public.address.hex)
      const boundWitnessWrapper = boundWitnessWrappers[0]
      expect(transactionResults.payload_hashes).toBeArrayOfSize(boundWitnessWrapper.payloadsArray.length + 3)
      boundWitnessWrapper.payloadsArray.forEach((p) => {
        expect(transactionResults.payload_hashes).toInclude(p.hash)
      })
      expect(insertResult1.map((bw) => BoundWitnessWrapper.parse(bw).boundwitness)).toMatchSnapshot()
    })
    it('inserts multiple payloads', () => {
      expect(insertResult3).toBeTruthy()
      expect(insertResult3).toBeArrayOfSize(2)
      const [boundResult, transactionResults] = insertResult3
      expect(boundResult.addresses).toContain(archivist.address)
      expect(transactionResults.addresses).toContain(moduleAccount.public.address.hex)
      const boundWitnessWrapper = boundWitnessWrappers[2]
      expect(transactionResults.payload_hashes).toBeArrayOfSize(boundWitnessWrapper.payloadsArray.length + 3)
      boundWitnessWrapper.payloadsArray.forEach((p) => {
        expect(transactionResults.payload_hashes).toInclude(p.hash)
      })
      expect(insertResult3.map((bw) => BoundWitnessWrapper.parse(bw).boundwitness)).toMatchSnapshot()
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
      const results = await archivist.get(payloads.map((p) => p.hash))
      expect(results).toBeTruthy()
      expect(results).toBeArrayOfSize(payloads.length)
      const resultPayloads = results.map((result) => PayloadWrapper.parse(result))
      const resultHashes = resultPayloads.map((p) => p.hash)
      payloads.map((p) => {
        expect(resultHashes).toInclude(p.hash)
      })
      expect(results).toMatchSnapshot()
    })
  })
})
