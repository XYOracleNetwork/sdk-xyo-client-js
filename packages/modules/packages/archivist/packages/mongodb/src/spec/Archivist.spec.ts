import '@xylabs/vitest-extended'

import { delay } from '@xylabs/delay'
import type { BaseMongoSdkConfig } from '@xylabs/mongo'
import { Account } from '@xyo-network/account'
import type { ArchivistNextOptions } from '@xyo-network/archivist-model'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { COLLECTIONS, hasMongoDBConfig } from '@xyo-network/module-abstract-mongodb'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { PayloadWrapperBase } from '@xyo-network/payload-wrapper'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import {
  beforeAll,
  describe, expect, it,
} from 'vitest'

import { MongoDBArchivist } from '../Archivist.js'

type TestDataGetter<T> = () => T

describe.runIf(hasMongoDBConfig())('Archivist', () => {
  const boundWitnessesConfig: BaseMongoSdkConfig = { collection: COLLECTIONS.BoundWitnesses }
  const payloadsConfig: BaseMongoSdkConfig = { collection: COLLECTIONS.Payloads }

  const payloadWrappers: PayloadWrapper[] = []
  const boundWitnessWrappers: BoundWitnessWrapper[] = []
  let archivist: ArchivistWrapper
  beforeAll(async () => {
    boundWitnessesConfig.dbConnectionString = process.env.MONGO_CONNECTION_STRING
    payloadsConfig.dbConnectionString = process.env.MONGO_CONNECTION_STRING

    const mod = await MongoDBArchivist.create({
      account: 'random',
      boundWitnessSdkConfig: boundWitnessesConfig,
      config: { schema: MongoDBArchivist.defaultConfigSchema },
      payloadSdkConfig: payloadsConfig,
    })
    archivist = new ArchivistWrapper({ mod: mod, account: await Account.random() })
    const payload1 = { nonce: Date.now(), schema: 'network.xyo.debug' }
    await delay(2)
    const payload2 = { nonce: Date.now(), schema: 'network.xyo.test' }
    await delay(2)
    const payload3 = { nonce: Date.now(), schema: 'network.xyo.debug' }
    await delay(2)
    const payload4 = { nonce: Date.now(), schema: 'network.xyo.test' }
    await delay(2)
    const payloadWrapper1 = PayloadWrapper.wrap(payload1)
    const payloadWrapper2 = PayloadWrapper.wrap(payload2)
    const payloadWrapper3 = PayloadWrapper.wrap(payload3)
    const payloadWrapper4 = PayloadWrapper.wrap(payload4)
    payloadWrappers.push(payloadWrapper1, payloadWrapper2, payloadWrapper3, payloadWrapper4)
    const signer = await Account.random()
    const boundWitness1 = (await new BoundWitnessBuilder().payload(payloadWrapper1.payload).signer(signer).build())[0]
    await delay(2)
    const boundWitness2 = (await new BoundWitnessBuilder().payload(payloadWrapper2.payload).signer(signer).build())[0]
    await delay(2)
    const boundWitness3 = (
      await new BoundWitnessBuilder().payloads([payloadWrapper3.payload, payloadWrapper4.payload]).signer(signer).build()
    )[0]
    const boundWitnessWrapper1 = BoundWitnessWrapper.parse(boundWitness1, [payload1])
    const boundWitnessWrapper2 = BoundWitnessWrapper.parse(boundWitness2, [payload2])
    const boundWitnessWrapper3 = BoundWitnessWrapper.parse(boundWitness3, [payload3, payload4])
    boundWitnessWrappers.push(boundWitnessWrapper1, boundWitnessWrapper2, boundWitnessWrapper3)
  })

  describe('discover', () => {
    it('discovers module', async () => {
      const result = await archivist.state()
      expect(result).toBeArray()
      expect(result.length).toBeGreaterThan(0)
    })
  })
  describe('insert', () => {
    const cases: [string, TestDataGetter<PayloadWrapperBase[]>][] = [
      ['inserts single payload', () => [payloadWrappers[0]]],
      ['inserts multiple payloads', () => [payloadWrappers[1], payloadWrappers[2]]],
      ['inserts single boundwitness', () => [boundWitnessWrappers[0]]],
      ['inserts multiple boundwitness', () => [boundWitnessWrappers[1], boundWitnessWrappers[2]]],
    ]
    it.each(cases)('%s', async (_title, getData) => {
      const payloads = getData()
      const results = await archivist.insert(payloads.map(w => w.payload))
      expect(results).toBeArrayOfSize(payloads.length)
      for (const [i, result] of results.entries()) {
        const payload = payloads[i]
        expect(await PayloadBuilder.dataHash(result)).toEqual(await payload.dataHash())
        expect(await PayloadBuilder.dataHash(result)).toEqual(await PayloadBuilder.dataHash(payload.payload))
        expect(await PayloadBuilder.hash(result)).toEqual(await PayloadBuilder.hash(payload.payload))
        expect(PayloadBuilder.omitStorageMeta(result)).toEqual(payload.payload)
      }
    })
  })
  describe('get', () => {
    const cases: [string, TestDataGetter<PayloadWrapperBase[]>][] = [
      ['gets single payload', () => [payloadWrappers[0]]],
      ['gets multiple payloads', () => [payloadWrappers[1], payloadWrappers[2]]],
      ['gets single boundwitness', () => [boundWitnessWrappers[0]]],
      ['gets multiple boundwitness', () => [boundWitnessWrappers[1], boundWitnessWrappers[2]]],
    ]
    it.each(cases)('%s', async (_title, getData) => {
      const payloads = getData()
      const results = await archivist.get(await Promise.all(payloads.map(p => p.dataHash())))
      for (const [i, result] of results.entries()) {
        const payload = payloads[i]
        expect(await PayloadBuilder.dataHash(result)).toEqual(await payload.dataHash())
        expect(await PayloadBuilder.dataHash(result)).toEqual(await PayloadBuilder.dataHash(payload.payload))
        expect(await PayloadBuilder.hash(result)).toEqual(await PayloadBuilder.hash(payload.payload))
        expect(PayloadBuilder.omitStorageMeta(result)).toEqual(payload.payload)
      }
    })
  })
  // NOTE: Skipped because memory DB re-used by all tests
  // causing these tests to be non-deterministic and fail
  describe.skip('next', () => {
    const payloads: BoundWitnessWrapper | PayloadWrapper[] = []
    beforeAll(async () => {
      for (let i = 0; i < 10; i++) {
        const payload1 = { nonce: Date.now(), schema: 'network.xyo.debug' }
        const payloadWrapper1 = PayloadWrapper.wrap(payload1)
        await delay(2)
        const payload2 = { nonce: Date.now(), schema: 'network.xyo.test' }
        const payloadWrapper2 = PayloadWrapper.wrap(payload2)
        await delay(2)
        const signer = await Account.random()
        const boundWitness = (await new BoundWitnessBuilder()
          .payloads([payloadWrapper1, payloadWrapper2].map(p => p.payload))
          .signer(signer)
          .build())[0]
        const boundWitnessWrapper = BoundWitnessWrapper.parse(boundWitness, [payload1, payload2])
        await archivist.insert([boundWitnessWrapper.payload])
        await delay(2)
        await archivist.insert([payloadWrapper1.payload])
        await delay(2)
        await archivist.insert([payloadWrapper2.payload])
        await delay(2)
        payloads.push(boundWitnessWrapper, payloadWrapper1, payloadWrapper2)
      }
    })
    describe('desc', () => {
      describe('with no offset', () => {
        it('returns payloads from the last one inserted in descending order', async () => {
          const expected = payloads
          const options: ArchivistNextOptions = { limit: expected.length, order: 'desc' }
          const results = await archivist.next(options)
          expect(results).toBeArrayOfSize(expected.length)
          for (const [i, result] of results.toReversed().entries()) {
            const payload = expected[i]
            expect(await PayloadBuilder.dataHash(result)).toEqual(await payload.dataHash())
            expect(await PayloadBuilder.dataHash(result)).toEqual(await PayloadBuilder.dataHash(payload.payload))
            expect(await PayloadBuilder.hash(result)).toEqual(await PayloadBuilder.hash(payload.payload))
            expect(result).toEqual(payload.payload)
          }
        })
      })
    })
  })
})
