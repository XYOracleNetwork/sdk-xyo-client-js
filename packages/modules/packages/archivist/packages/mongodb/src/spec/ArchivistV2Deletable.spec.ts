import '@xylabs/vitest-extended'

import type { BaseMongoSdkConfig } from '@xylabs/mongo'
import { delay } from '@xylabs/sdk-js'
import { Account } from '@xyo-network/account'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import type { BoundWitness } from '@xyo-network/boundwitness-model'
import { hasMongoDBConfig } from '@xyo-network/module-abstract-mongodb'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { asSchema, type Payload } from '@xyo-network/payload-model'
import {
  beforeAll,
  describe, expect, it,
} from 'vitest'

import { MongoDBArchivistV2Deletable } from '../ArchivistV2.ts'

type TestDataGetter<T> = () => T

describe.runIf(hasMongoDBConfig())('MongoDBArchivistV2Deletable', () => {
  const payloadsConfig: BaseMongoSdkConfig = { collection: 'test' }
  const payloads: Payload[] = []
  const boundWitnesses: BoundWitness[] = []
  let archivist: ArchivistWrapper
  beforeAll(async () => {
    payloadsConfig.dbConnectionString = process.env.MONGO_CONNECTION_STRING
    const mod = await MongoDBArchivistV2Deletable.create({
      account: 'random',
      config: { schema: MongoDBArchivistV2Deletable.defaultConfigSchema },
      payloadSdkConfig: payloadsConfig,
    })
    await mod.start()
    archivist = new ArchivistWrapper({ mod: mod, account: await Account.random() })
    const payload1: Payload = new PayloadBuilder({ schema: asSchema('network.xyo.debug', true) }).fields({ nonce: Date.now() }).build()
    await delay(2)
    const payload2: Payload = new PayloadBuilder({ schema: asSchema('network.xyo.test', true) }).fields({ nonce: Date.now() }).build()
    await delay(2)
    const payload3: Payload = new PayloadBuilder({ schema: asSchema('network.xyo.debug', true) }).fields({ nonce: Date.now() }).build()
    await delay(2)
    const payload4: Payload = new PayloadBuilder({ schema: asSchema('network.xyo.test', true) }).fields({ nonce: Date.now() }).build()
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
  }, 1_000_000)

  describe('delete', () => {
    const cases: [string, TestDataGetter<Payload[]>][] = [
      ['deletes single payload', () => [payloads[0]]],
      ['deletes multiple payloads', () => [payloads[1], payloads[2]]],
    ]
    it.each(cases)('%s', async (_title, getData) => {
      const payloads = getData()
      const results = await archivist.insert(payloads)
      expect(results).toBeArrayOfSize(payloads.length)
      const hashes = await PayloadBuilder.hashes(payloads)
      expect(await archivist.get(hashes)).toBeArrayOfSize(payloads.length)
      const deleted = await archivist.delete(hashes)
      expect(deleted).toBeArrayOfSize(payloads.length)
      expect(await archivist.get(hashes)).toBeArrayOfSize(0)
    })
  })
})
