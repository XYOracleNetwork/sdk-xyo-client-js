import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import {
  DebugPayload,
  DebugPayloadWithMeta,
  DebugSchema,
  XyoBoundWitnessFilterPredicate,
  XyoBoundWitnessWithMeta,
  XyoPayloadFilterPredicate,
  XyoPayloadWithMeta,
  XyoPayloadWithPartialMeta,
} from '@xyo-network/node-core-model'
import { PayloadWrapper, XyoPayloadBuilder } from '@xyo-network/payload'
import { v4 } from 'uuid'

import { COLLECTIONS } from '../../collections'
import { getBaseMongoSdk } from '../../Mongo'
import { MongoDBBoundWitnessArchivist } from './MongoDBBoundWitnessArchivist'

const count = 2
const schema = DebugSchema
const limit = 1

const getPayloads = (archive: string, count = 1): XyoPayloadWithMeta<DebugPayload>[] => {
  const payloads: XyoPayloadWithMeta<DebugPayload>[] = []
  for (let i = 0; i < count; i++) {
    const nonce = v4()
    const payload = new XyoPayloadBuilder<DebugPayloadWithMeta>({ schema }).fields({ nonce }).build()
    payload._archive = archive
    payloads.push(payload)
  }
  return payloads
}

const removePayloads = (boundWitness: XyoBoundWitnessWithMeta) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _payloads, _timestamp, timestamp, ...props } = boundWitness
  return { ...props, _timestamp: expect.toBeNumber(), timestamp: expect.toBeNumber() }
}

describe('MongoDBBoundWitnessArchivist', () => {
  const sdk = getBaseMongoSdk<XyoBoundWitnessWithMeta>(COLLECTIONS.BoundWitnesses)
  const account = Account.random()
  const sut = new MongoDBBoundWitnessArchivist(account, sdk)
  const archive = `test-${v4()}`
  const payloads: XyoPayloadWithMeta<DebugPayload>[] = getPayloads(archive, count)
  const boundWitnesses = payloads
    .map((p) => new BoundWitnessBuilder({ inlinePayloads: true }).witness(account).payload(p).build())
    .map((buildResult) => buildResult[0])
    .map((bw) => {
      return { ...bw, _archive: archive } as XyoBoundWitnessWithMeta & XyoPayloadWithPartialMeta
    })
  const hashes: string[] = boundWitnesses.map((bw) => new PayloadWrapper(bw).hash)
  const boundWitness = assertEx(boundWitnesses.at(-1))
  const hash = assertEx(hashes.at(-1))

  beforeAll(async () => {
    const wrapper = new ArchivistWrapper(sut)
    const result = await wrapper.insert(boundWitnesses)
    expect(result).toBeArrayOfSize(count)
    expect(result?.[0].addresses).toContain(account.addressValue.hex)
    expect(result?.[1].payload_hashes).toIncludeAllMembers(hashes)
  })

  describe('insert', () => {
    it('inserts multiple boundWitnesses', async () => {
      // NOTE: Done as part of beforeAll out of necessity
      // for subsequent tests. Not repeated again here for
      // performance.
    })
  })
  describe('find', () => {
    it('finds boundWitnesses by hash', async () => {
      const filter: XyoPayloadFilterPredicate<XyoPayloadWithMeta> = { hash, limit }
      const wrapper = new ArchivistWrapper(sut)
      const result = await wrapper.find(filter)
      expect(result).toBeArrayOfSize(limit)
      expect(result).toEqual([boundWitness].map(removePayloads))
    })
    it('finds boundWitnesses by address', async () => {
      const addresses = [`${account.addressValue.hex}`]
      const filter: XyoBoundWitnessFilterPredicate = { addresses, limit }
      const wrapper = new ArchivistWrapper(sut)
      const result = await wrapper.find(filter)
      expect(result).toBeArrayOfSize(limit)
      expect(result).toEqual([boundWitness].map(removePayloads))
    })
  })
  describe('get', () => {
    it('gets boundWitnesses by hashes', async () => {
      const wrapper = new ArchivistWrapper(sut)
      const result = await wrapper.get(hashes)
      expect(result).toBeArrayOfSize(count)
      expect(result).toContainValues([boundWitness].map(removePayloads))
    })
  })
})
