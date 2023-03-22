import { Account } from '@xyo-network/account'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { ArchivistGetQuerySchema, ArchivistInsertQuerySchema, ArchivistWrapper } from '@xyo-network/modules'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper, PayloadWrapperBase } from '@xyo-network/payload-wrapper'

import { getArchivist, getNewBoundWitness, getNewPayload, validateDiscoverResponse } from '../../testUtil'

const moduleName = 'Archivist'

describe(`/${moduleName}`, () => {
  let archivist: ArchivistWrapper
  const account = Account.random()

  beforeAll(async () => {
    archivist = await getArchivist()
  })
  describe('ModuleDiscoverQuerySchema', () => {
    it('discovers', async () => {
      const response = await archivist.discover()
      expect(response).toBeArray()
      validateDiscoverResponse(response, [ArchivistGetQuerySchema, ArchivistInsertQuerySchema])
    })
  })
  describe('ArchivistInsertQuerySchema', () => {
    const payload: PayloadWrapper = PayloadWrapper.parse(getNewPayload())
    const boundWitness: BoundWitnessWrapper = BoundWitnessWrapper.parse(getNewBoundWitness(account, [payload])[0])
    const cases: [string, PayloadWrapperBase[]][] = [
      ['payload', [payload]],
      ['boundwitness', [boundWitness]],
    ]
    it.each(cases)('inserts %s', async (_, wrapped) => {
      const payloads = wrapped.map((w) => w.payload)
      const hashes = wrapped.map((w) => w.hash)
      const response = await archivist.insert(payloads)
      expect(response).toBeArray()
      expect(response.length).toBeGreaterThan(0)
      const bw = response.at(-1)
      expect(bw).toBeObject()
      expect(bw?.payload_hashes).toBeArray()
      expect(bw?.payload_hashes).toContainValues(hashes)
    })
  })
  describe('ArchivistGetQuerySchema', () => {
    const payload: PayloadWrapper = PayloadWrapper.parse(getNewPayload())
    const boundWitness: BoundWitnessWrapper = BoundWitnessWrapper.parse(getNewBoundWitness(account, [payload])[0])
    beforeAll(async () => {
      await archivist.insert([boundWitness.boundwitness, payload.payload])
    })
    it('finds payload by hash', async () => {
      const response = await archivist.get([payload.hash])
      expect(response).toBeArrayOfSize(1)
      const actual = response.pop()
      expect(PayloadWrapper.parse(actual).hash).toBe(payload.hash)
    })
    it('finds boundwitness by hash', async () => {
      const response = await archivist.get([boundWitness.hash])
      expect(response).toBeArrayOfSize(1)
      const actual = response.pop()
      expect(PayloadWrapper.parse(actual).hash).toBe(boundWitness.hash)
    })
  })
})
