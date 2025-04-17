import '@xylabs/vitest-extended'

import { Account } from '@xyo-network/account'
import type { ArchivistInsertQuery } from '@xyo-network/archivist-model'
import { ArchivistInsertQuerySchema } from '@xyo-network/archivist-model'
import { BoundWitnessBuilder, QueryBoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import type { BoundWitness } from '@xyo-network/boundwitness-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { Payload } from '@xyo-network/payload-model'
import type { PayloadWithMongoMeta } from '@xyo-network/payload-mongodb'
import {
  beforeAll, describe, expect, it,
} from 'vitest'

import { validByType } from '../validByType.js'

type DebugPayloadWithMongoMeta = Partial<PayloadWithMongoMeta<{ nonce: string; schema: string }>> & { schema: string }

describe('validByType', () => {
  const account = Account.random()
  describe('QueryBoundWitness with Payloads & nested BoundWitnesses', () => {
    let result: [BoundWitness[], Payload[]]
    beforeAll(async () => {
      const payload1 = new PayloadBuilder<DebugPayloadWithMongoMeta>({ schema: 'network.xyo.debug' }).fields({ nonce: '1' }).build()
      const payload2 = new PayloadBuilder<DebugPayloadWithMongoMeta>({ schema: 'network.xyo.debug' }).fields({ nonce: '2' }).build()
      const [innerBw] = await (new BoundWitnessBuilder().signer(await account).payload(payload2)).build()
      const outer = await (new BoundWitnessBuilder().signer(await account).payloads([payload1, innerBw as Payload])).build()
      const queryPayload: ArchivistInsertQuery = { schema: ArchivistInsertQuerySchema }
      const query = await (new QueryBoundWitnessBuilder().signer(await account).query(queryPayload)).build()
      const values = await PayloadBuilder.addStorageMeta([query[0], outer[0], innerBw as Payload, payload1, payload2])
      result = await validByType(values)
    })
    it('extracts the BoundWitnesses', () => {
      expect(result).toBeArray()
      expect(result?.[0]).toBeArrayOfSize(3)
    })
    it('extracts the Payloads', () => {
      expect(result?.[1]).toBeArrayOfSize(2)
    })
  })
  describe('BoundWitness with Payloads & nested BoundWitnesses', () => {
    let result: [BoundWitness[], Payload[]]
    beforeAll(async () => {
      const payload1 = new PayloadBuilder<DebugPayloadWithMongoMeta>({ schema: 'network.xyo.debug' }).fields({ nonce: '1' }).build()
      const payload2 = new PayloadBuilder<DebugPayloadWithMongoMeta>({ schema: 'network.xyo.debug' }).fields({ nonce: '2' }).build()
      const [innerBw] = await (new BoundWitnessBuilder().signer(await account).payload(payload2)).build()
      const outer = await (new BoundWitnessBuilder().signer(await account).payloads([payload1, innerBw as Payload])).build()
      const values = await PayloadBuilder.addStorageMeta([outer[0], innerBw as Payload, payload1, payload2])
      result = await validByType(values)
    })
    it('extracts the BoundWitnesses', () => {
      expect(result).toBeArray()
      expect(result?.[0]).toBeArrayOfSize(2)
    })
    it('extracts the Payloads', () => {
      expect(result?.[1]).toBeArrayOfSize(2)
    })
  })
  describe('BoundWitness with Payloads', () => {
    let result: [BoundWitness[], Payload[]]
    beforeAll(async () => {
      const payload1 = new PayloadBuilder<DebugPayloadWithMongoMeta>({ schema: 'network.xyo.debug' }).fields({ nonce: '1' }).build()
      const payload2 = new PayloadBuilder<DebugPayloadWithMongoMeta>({ schema: 'network.xyo.debug' }).fields({ nonce: '2' }).build()
      const outer = await new BoundWitnessBuilder().signer(await account).payloads([payload1, payload2]).build()
      const values = await PayloadBuilder.addStorageMeta([outer[0], payload1, payload2])
      result = await validByType(values)
    })
    it('extracts the BoundWitnesses', () => {
      expect(result).toBeArray()
      expect(result?.[0]).toBeArrayOfSize(1)
    })
    it('extracts the Payloads', () => {
      expect(result?.[1]).toBeArrayOfSize(2)
    })
  })
  describe('BoundWitness without Payloads', () => {
    let result: [BoundWitness[], Payload[]]
    beforeAll(async () => {
      const outer = await new BoundWitnessBuilder().signer(await account).build()
      const values = await PayloadBuilder.addStorageMeta([outer[0]])
      result = await validByType(values)
    })
    it('extracts the BoundWitnesses', () => {
      expect(result).toBeArray()
      expect(result?.[0]).toBeArrayOfSize(1)
    })
    it('extracts the Payloads', () => {
      expect(result?.[1]).toBeArrayOfSize(0)
    })
  })
})
