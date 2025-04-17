import '@xylabs/vitest-extended'

import { delay } from '@xylabs/delay'
import type { BaseMongoSdkConfig } from '@xylabs/mongo'
import { Account } from '@xyo-network/account'
import { generateArchivistNextTests } from '@xyo-network/archivist-acceptance-tests'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import type { BoundWitness } from '@xyo-network/boundwitness-model'
import { COLLECTIONS, hasMongoDBConfig } from '@xyo-network/module-abstract-mongodb'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { Payload } from '@xyo-network/payload-model'
import {
  beforeAll,
  describe, expect, it,
} from 'vitest'

import { MongoDBArchivistV2 } from '../ArchivistV2.ts'

type TestDataGetter<T> = () => T

describe.runIf(hasMongoDBConfig())('Archivist', () => {
  const boundWitnessesConfig: BaseMongoSdkConfig = { collection: COLLECTIONS.BoundWitnesses }
  const payloadsConfig: BaseMongoSdkConfig = { collection: COLLECTIONS.Payloads }

  const payloads: Payload[] = []
  const boundWitnesses: BoundWitness[] = []
  let archivist: ArchivistWrapper
  beforeAll(async () => {
    boundWitnessesConfig.dbConnectionString = process.env.MONGO_CONNECTION_STRING
    payloadsConfig.dbConnectionString = process.env.MONGO_CONNECTION_STRING

    const mod = await MongoDBArchivistV2.create({
      account: 'random',
      config: { schema: MongoDBArchivistV2.defaultConfigSchema },
      payloadSdkConfig: payloadsConfig,
    })
    archivist = new ArchivistWrapper({ mod: mod, account: await Account.random() })
    const payload1: Payload = new PayloadBuilder({ schema: 'network.xyo.debug' }).fields({ nonce: Date.now() }).build()
    await delay(2)
    const payload2: Payload = new PayloadBuilder({ schema: 'network.xyo.test' }).fields({ nonce: Date.now() }).build()
    await delay(2)
    const payload3: Payload = new PayloadBuilder({ schema: 'network.xyo.debug' }).fields({ nonce: Date.now() }).build()
    await delay(2)
    const payload4: Payload = new PayloadBuilder({ schema: 'network.xyo.test' }).fields({ nonce: Date.now() }).build()
    await delay(2)
    payloads.push(payload1, payload2, payload3, payload4)
    const signer = await Account.random()
    const boundWitness1 = (await new BoundWitnessBuilder().payload(payload1).signer(signer).build())[0]
    await delay(2)
    const boundWitness2 = (await new BoundWitnessBuilder().payload(payload2).signer(signer).build())[0]
    await delay(2)
    const boundWitness3 = (
      await new BoundWitnessBuilder().payloads([payload3, payload4]).signer(signer).build()
    )[0]
    boundWitnesses.push(boundWitness1, boundWitness2, boundWitness3)
  })

  describe('discover', () => {
    it('discovers module', async () => {
      const result = await archivist.state()
      expect(result).toBeArray()
      expect(result.length).toBeGreaterThan(0)
    })
  })
  describe('insert', () => {
    const cases: [string, TestDataGetter<Payload[]>][] = [
      ['inserts single payload', () => [payloads[0]]],
      ['inserts multiple payloads', () => [payloads[1], payloads[2]]],
      ['inserts single boundwitness', () => [boundWitnesses[0]]],
      ['inserts multiple boundwitness', () => [boundWitnesses[1], boundWitnesses[2]]],
    ]
    it.each(cases)('%s', async (_title, getData) => {
      const payloads = getData()
      const results = await archivist.insert(payloads)
      expect(results).toBeArrayOfSize(payloads.length)
      for (const [i, result] of results.entries()) {
        const payload = payloads[i]
        expect(await PayloadBuilder.dataHash(result)).toEqual(await PayloadBuilder.dataHash(payload))
        expect(await PayloadBuilder.hash(result)).toEqual(await PayloadBuilder.hash(payload))
        expect(PayloadBuilder.omitStorageMeta(result)).toEqual(payload)
      }
    })
  })
  describe('insert (duplicates)', () => {
    const cases: [string, TestDataGetter<Payload[]>][] = [
      ['inserts single payload', () => [payloads[0]]],
      ['inserts multiple payloads', () => [payloads[1], payloads[2]]],
      ['inserts single boundwitness', () => [boundWitnesses[0]]],
      ['inserts multiple boundwitness', () => [boundWitnesses[1], boundWitnesses[2]]],
    ]
    it.each(cases)('%s', async (_title, getData) => {
      const payloads = getData()
      const results = await archivist.insert(payloads)
      expect(results).toBeArrayOfSize(0)
      for (const [i, result] of results.entries()) {
        const payload = payloads[i]
        expect(await PayloadBuilder.dataHash(result)).toEqual(await PayloadBuilder.dataHash(payload))
        expect(await PayloadBuilder.hash(result)).toEqual(await PayloadBuilder.hash(payload))
        expect(PayloadBuilder.omitStorageMeta(result)).toEqual(payload)
      }
    })
  })
  describe('get', () => {
    const cases: [string, TestDataGetter<Payload[]>][] = [
      ['gets single payload', () => [payloads[0]]],
      ['gets multiple payloads', () => [payloads[1], payloads[2]]],
      ['gets single boundwitness', () => [boundWitnesses[0]]],
      ['gets multiple boundwitness', () => [boundWitnesses[1], boundWitnesses[2]]],
    ]
    it.each(cases)('%s', async (_title, getData) => {
      const payloads = getData()
      const hashes = await Promise.all(payloads.map(async payload => await PayloadBuilder.dataHash(payload)))
      const results = await archivist.get(hashes)
      for (const [i, result] of results.entries()) {
        const payload = payloads[i]
        expect(await PayloadBuilder.dataHash(result)).toEqual(await PayloadBuilder.dataHash(payload))
        expect(await PayloadBuilder.hash(result)).toEqual(await PayloadBuilder.hash(payload))
        expect(PayloadBuilder.omitStorageMeta(result)).toEqual(payload)
      }
    })
  })
  generateArchivistNextTests(() => {
    return Promise.resolve(archivist)
  })
})
