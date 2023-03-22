import { Account } from '@xyo-network/account'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { ArchivistGetQuerySchema, ArchivistInsertQuerySchema, ArchivistWrapper } from '@xyo-network/modules'
import { PayloadWrapper, PayloadWrapperBase } from '@xyo-network/payload-wrapper'

import { getArchivist, getNewBoundWitness, getNewPayload, validateDiscoverResponse } from '../../testUtil'

const moduleName = 'Archivist'

describe(`/${moduleName}`, () => {
  let archivist: ArchivistWrapper
  const account = Account.random()

  const payloadA: PayloadWrapper = PayloadWrapper.parse(getNewPayload())
  const boundWitnessA: BoundWitnessWrapper = BoundWitnessWrapper.parse(getNewBoundWitness(account, [payloadA])[0])
  const payloadB: PayloadWrapper = PayloadWrapper.parse(getNewPayload())
  const boundWitnessB: BoundWitnessWrapper = BoundWitnessWrapper.parse(getNewBoundWitness(account, [payloadA])[0])
  const payloadC: PayloadWrapper = PayloadWrapper.parse(getNewPayload())
  const boundWitnessC: BoundWitnessWrapper = BoundWitnessWrapper.parse(getNewBoundWitness(account, [payloadA])[0])
  const payloadD: PayloadWrapper = PayloadWrapper.parse(getNewPayload())
  const boundWitnessD: BoundWitnessWrapper = BoundWitnessWrapper.parse(getNewBoundWitness(account, [payloadA])[0])
  const payloadE: PayloadWrapper = PayloadWrapper.parse(getNewPayload())
  const boundWitnessE: BoundWitnessWrapper = BoundWitnessWrapper.parse(getNewBoundWitness(account, [payloadA])[0])

  const cases: [string, PayloadWrapperBase[]][] = [
    ['Payload', [payloadA]],
    ['BoundWitness', [boundWitnessA]],
    ['Payloads', [payloadB, payloadC]],
    ['BoundWitnesses', [boundWitnessB, boundWitnessC]],
    ['Payloads & BoundWitnesses', [boundWitnessD, payloadD, boundWitnessE, payloadE]],
  ]

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
    it.each(cases)('finds %s by hash', async (_, wrapped) => {
      const hashes = wrapped.map((w) => w.hash)
      const response = await archivist.get(hashes)
      expect(response).toBeArray()
      expect(response).toBeArrayOfSize(wrapped.length)
      const responseHashes = response.map((p) => PayloadWrapper.hash(p))
      expect(responseHashes).toContainValues(hashes)
    })
  })
})
