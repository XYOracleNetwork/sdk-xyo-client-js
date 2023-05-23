import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { ArchivistGetQuerySchema, ArchivistInsertQuerySchema, ArchivistWrapper } from '@xyo-network/modules'
import { PayloadWrapper, PayloadWrapperBase } from '@xyo-network/payload-wrapper'

import { getArchivist, getNewBoundWitness, getNewPayload, nonExistentHash, unitTestSigningAccount, validateDiscoverResponse } from '../../testUtil'

const moduleName = 'Archivist'

describe.skip(`/${moduleName}`, () => {
  const account = unitTestSigningAccount
  const payloadA = PayloadWrapper.parse(getNewPayload())
  const payloadB = PayloadWrapper.parse(getNewPayload())
  const payloadC = PayloadWrapper.parse(getNewPayload())
  const payloadD = PayloadWrapper.parse(getNewPayload())
  const payloadE = PayloadWrapper.parse(getNewPayload())
  let boundWitnessA: BoundWitnessWrapper
  let boundWitnessB: BoundWitnessWrapper
  let boundWitnessC: BoundWitnessWrapper
  let boundWitnessD: BoundWitnessWrapper
  let boundWitnessE: BoundWitnessWrapper
  let archivist: ArchivistWrapper
  let cases: [string, PayloadWrapperBase[]][] = []
  beforeAll(async () => {
    archivist = await getArchivist()
    boundWitnessA = BoundWitnessWrapper.parse((await getNewBoundWitness([account], [payloadA.payload]))[0])
    boundWitnessB = BoundWitnessWrapper.parse((await getNewBoundWitness([account], [payloadB.payload]))[0])
    boundWitnessC = BoundWitnessWrapper.parse((await getNewBoundWitness([account], [payloadC.payload]))[0])
    boundWitnessD = BoundWitnessWrapper.parse((await getNewBoundWitness([account], [payloadD.payload]))[0])
    boundWitnessE = BoundWitnessWrapper.parse((await getNewBoundWitness([account], [payloadE.payload]))[0])
    const bws = [
      boundWitnessA.boundwitness,
      boundWitnessB.boundwitness,
      boundWitnessC.boundwitness,
      boundWitnessD.boundwitness,
      boundWitnessE.boundwitness,
    ]
    const payloads = [payloadA.payload, payloadB.payload, payloadC.payload, payloadD.payload, payloadE.payload]
    await archivist.insert([...bws, ...payloads])
    cases = [
      ['Payload', [payloadA]],
      ['BoundWitness', [boundWitnessA]],
      ['Payloads', [payloadB, payloadC]],
      ['BoundWitnesses', [boundWitnessB, boundWitnessC]],
      ['Payloads & BoundWitnesses', [boundWitnessD, payloadD, boundWitnessE, payloadE]],
    ]
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
    describe('with existing hash', () => {
      it.each(cases)('finds %s by hash', async (_, wrapped) => {
        const hashes = wrapped.map((w) => w.hash)
        const response = await archivist.get(hashes)
        expect(response).toBeArray()
        expect(response).toBeArrayOfSize(wrapped.length)
        const responseHashes = response.map((p) => PayloadWrapper.hash(p))
        expect(responseHashes).toContainValues(hashes)
      })
    })
    describe('with non-existent hash', () => {
      it('returns nothing', async () => {
        const response = await archivist.get([nonExistentHash])
        expect(response).toBeArrayOfSize(0)
      })
    })
  })
})
