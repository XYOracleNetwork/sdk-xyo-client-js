import { ArchivistGetQuerySchema, ArchivistInsertQuerySchema, ArchivistInstance } from '@xyo-network/archivist'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { PayloadHasher } from '@xyo-network/core'
import { PayloadWrapper, PayloadWrapperBase } from '@xyo-network/payload-wrapper'

import { getArchivist, getNewBoundWitness, getNewPayload, nonExistentHash, unitTestSigningAccount, validateDiscoverResponse } from '../../testUtil'

const moduleName = 'Archivist'

describe(`/${moduleName}`, () => {
  const boundWitnessWrappers: BoundWitnessWrapper[] = []
  const payloadWrappers: PayloadWrapper[] = []
  let archivist: ArchivistInstance
  const cases: [string, PayloadWrapperBase[]][] = [
    ['Payload', []],
    ['BoundWitness', []],
    ['Payloads', []],
    ['BoundWitnesses', []],
    ['Payloads & BoundWitnesses', []],
  ]
  beforeAll(async () => {
    const account = await unitTestSigningAccount()
    archivist = await getArchivist()
    const payloadWrapperA = PayloadWrapper.wrap(getNewPayload())
    const payloadWrapperB = PayloadWrapper.wrap(getNewPayload())
    const payloadWrapperC = PayloadWrapper.wrap(getNewPayload())
    const payloadWrapperD = PayloadWrapper.wrap(getNewPayload())
    const payloadWrapperE = PayloadWrapper.wrap(getNewPayload())
    payloadWrappers.push(payloadWrapperA, payloadWrapperB, payloadWrapperC, payloadWrapperD, payloadWrapperE)
    const boundWitnessWrapperA = BoundWitnessWrapper.parse((await getNewBoundWitness([account], [payloadWrapperA.payload()]))[0])
    const boundWitnessWrapperB = BoundWitnessWrapper.parse((await getNewBoundWitness([account], [payloadWrapperB.payload()]))[0])
    const boundWitnessWrapperC = BoundWitnessWrapper.parse((await getNewBoundWitness([account], [payloadWrapperC.payload()]))[0])
    const boundWitnessWrapperD = BoundWitnessWrapper.parse((await getNewBoundWitness([account], [payloadWrapperD.payload()]))[0])
    const boundWitnessWrapperE = BoundWitnessWrapper.parse((await getNewBoundWitness([account], [payloadWrapperE.payload()]))[0])
    boundWitnessWrappers.push(boundWitnessWrapperA, boundWitnessWrapperB, boundWitnessWrapperC, boundWitnessWrapperD, boundWitnessWrapperE)
    cases[0][1].push(payloadWrapperA)
    cases[1][1].push(boundWitnessWrapperA)
    cases[2][1].push(payloadWrapperB, payloadWrapperC)
    cases[3][1].push(boundWitnessWrapperB, boundWitnessWrapperC)
    cases[4][1].push(boundWitnessWrapperD, payloadWrapperD, boundWitnessWrapperE, payloadWrapperE)
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
      const payloads = wrapped.map((w) => w.payload())
      const response = await archivist.insert(payloads)
      expect(response).toBeArray()
      expect(response.length).toBeGreaterThan(0)
    })
  })
  describe('ArchivistGetQuerySchema', () => {
    describe('with existing hash', () => {
      it.each(cases)('finds %s by hash', async (_, wrapped) => {
        const hashes = wrapped.map((w) => w.hashSync())
        const response = await archivist.get(hashes)
        expect(response).toBeArray()
        expect(response).toBeArrayOfSize(wrapped.length)
        const responseHashes = await PayloadHasher.hashes(response)
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
