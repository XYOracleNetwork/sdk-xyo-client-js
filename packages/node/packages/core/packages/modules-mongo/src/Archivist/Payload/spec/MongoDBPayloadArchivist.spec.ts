import { Account } from '@xyo-network/account'
import { ArchivistConfigSchema } from '@xyo-network/archivist'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { XyoPayloadFilterPredicate, XyoPayloadWithMeta } from '@xyo-network/node-core-model'
import { XyoPayloadBuilder } from '@xyo-network/payload-builder'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { v4 } from 'uuid'

import { COLLECTIONS } from '../../../collections'
import { getBaseMongoSdk } from '../../../Mongo'
import { MongoDBPayloadArchivist } from '../MongoDBPayloadArchivist'

const count = 2
const schema = 'network.xyo.debug'
const limit = 1

type DebugPayloadWithMeta = XyoPayloadWithMeta & { nonce: string }

const getPayloads = (archive: string, count = 1): XyoPayloadWithMeta[] => {
  const payloads: XyoPayloadWithMeta[] = []
  for (let i = 0; i < count; i++) {
    const nonce = v4()
    const payload = new XyoPayloadBuilder<DebugPayloadWithMeta>({ schema }).fields({ nonce }).build()
    payload._archive = archive
    payloads.push(payload)
  }
  return payloads
}

describe('MongoDBPayloadArchivist', () => {
  const sdk = getBaseMongoSdk<XyoPayloadWithMeta>(COLLECTIONS.Payloads)
  const account = Account.random()
  const params = { account, config: { schema: ArchivistConfigSchema }, sdk }
  const archive = `test-${v4()}`
  const payloads: XyoPayloadWithMeta[] = getPayloads(archive, count)
  const hashes: string[] = payloads.map((p) => new PayloadWrapper(p).hash)
  const payload = payloads[0]
  const hash = hashes[0]
  let wrapper: ArchivistWrapper

  beforeAll(async () => {
    const sut = await MongoDBPayloadArchivist.create(params)
    wrapper = ArchivistWrapper.wrap(sut)
    const result = await wrapper.insert(payloads)
    expect(result).toBeArrayOfSize(count)
    expect(result?.[0].addresses).toContain(account.addressValue.hex)
    expect(result?.[1].payload_hashes).toIncludeAllMembers(hashes)
  })

  describe('insert', () => {
    it('inserts multiple payloads', async () => {
      // NOTE: Done as part of beforeAll out of necessity
      // for subsequent tests. Not repeated again here for
      // performance.
    })
  })
  describe('find', () => {
    it('finds payloads by schema', async () => {
      const filter: XyoPayloadFilterPredicate<XyoPayloadWithMeta> = { limit, schema }
      const result = await wrapper.find(filter)
      expect(result).toBeArrayOfSize(limit)
      expect(result?.[0]?.schema).toEqual(schema)
    })
    it('finds payloads by hash', async () => {
      const filter: XyoPayloadFilterPredicate<XyoPayloadWithMeta> = { hash, limit }
      const result = await wrapper.find(filter)
      expect(result).toBeArrayOfSize(limit)
      expect(result).toEqual([payload])
    })
  })
  describe('get', () => {
    it('gets payloads by hashes', async () => {
      const result = await wrapper.get(hashes)
      expect(result).toBeArrayOfSize(count)
      expect(result).toContainValues(payloads)
    })
  })
})
