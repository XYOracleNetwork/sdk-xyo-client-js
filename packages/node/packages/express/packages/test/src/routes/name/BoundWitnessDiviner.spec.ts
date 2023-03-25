import { Account } from '@xyo-network/account'
import { ArchivistWrapper } from '@xyo-network/archivist'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { DivinerWrapper, XyoDivinerDivineQuerySchema } from '@xyo-network/modules'
import { BoundWitnessQueryPayload, BoundWitnessQuerySchema } from '@xyo-network/node-core-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import {
  getArchivist,
  getDivinerByName,
  getNewBoundWitness,
  getNewPayload,
  getTestSchemaName,
  nonExistentHash,
  unitTestSigningAccount,
  validateDiscoverResponse,
} from '../../testUtil'

const schema = BoundWitnessQuerySchema

const moduleName = 'BoundWitnessDiviner'
describe(`/${moduleName}`, () => {
  const account = unitTestSigningAccount
  let diviner: DivinerWrapper
  let archivist: ArchivistWrapper

  beforeAll(async () => {
    diviner = await getDivinerByName(moduleName)
    archivist = await getArchivist()
  })
  describe('ModuleDiscoverQuerySchema', () => {
    it('discovers', async () => {
      const response = await diviner.discover()
      expect(response).toBeArray()
      validateDiscoverResponse(response, [XyoDivinerDivineQuerySchema])
    })
  })
  describe('XyoDivinerDivineQuerySchema', () => {
    const accountA = Account.random()
    const accountB = Account.random()
    const boundWitnessA = BoundWitnessWrapper.parse(getNewBoundWitness([accountA], [getNewPayload()])[0])
    const boundWitnessB = BoundWitnessWrapper.parse(getNewBoundWitness([accountB], [getNewPayload()])[0])
    const boundWitnessC = BoundWitnessWrapper.parse(getNewBoundWitness([accountA, accountB], [getNewPayload(), getNewPayload()])[0])
    const boundWitnesses = [boundWitnessA, boundWitnessB, boundWitnessC]
    beforeAll(async () => {
      await archivist.insert(boundWitnesses.map((b) => b.payload))
    })
    const cases: [title: string, address: string[], expected: BoundWitnessWrapper[]][] = [
      ['single address', [accountA.addressValue.hex], [boundWitnessA, boundWitnessC]],
      ['single address', [accountB.addressValue.hex], [boundWitnessB, boundWitnessC]],
      ['multiple addresses', [accountA.addressValue.hex, accountB.addressValue.hex], [boundWitnessA, boundWitnessB, boundWitnessC]],
    ]
    describe.each(cases)('address', () => {
      it('divines BoundWitnesses by address', async () => {
        await Promise.resolve()
        throw new Error('Not Implemented')
      })
      it.skip('divines BoundWitnesses by addresses', async () => {
        await Promise.resolve()
        throw new Error('Not Implemented')
      })
    })
    describe('hash', () => {
      const boundWitness: BoundWitnessWrapper = BoundWitnessWrapper.parse(getNewBoundWitness([account])[0])
      beforeAll(async () => await archivist.insert([boundWitness.payload]))
      it('divines BoundWitnesses by hash', async () => {
        const hash = boundWitness.hash
        const query: BoundWitnessQueryPayload = { hash, schema }
        const response = await diviner.divine([query])
        expect(response).toBeArrayOfSize(1)
        const responseHashes = response.map((p) => PayloadWrapper.hash(p))
        expect(responseHashes).toContainAllValues([boundWitness.hash])
      })
      it('returns empty array for non-existent hash', async () => {
        const hash = nonExistentHash
        const query: BoundWitnessQueryPayload = { hash, schema }
        const response = await diviner.divine([query])
        expect(response).toBeArrayOfSize(0)
      })
    })
    describe('limit', () => {
      const boundWitnesses = [getNewBoundWitness()[0], getNewBoundWitness()[0]]
      beforeAll(async () => await archivist.insert(boundWitnesses))
      it.each([1, 2])('returns the specified number of BoundWitnesses', async (limit) => {
        const query: BoundWitnessQueryPayload = { limit, schema }
        const response = await diviner.divine([query])
        expect(response).toBeArrayOfSize(limit)
      })
    })
    describe('offset', () => {
      it.skip('divines BoundWitnesses from offset', async () => {
        await Promise.resolve()
        throw new Error('Not Implemented')
      })
    })
    describe('order', () => {
      it.skip('divines BoundWitnesses in order', async () => {
        await Promise.resolve()
        throw new Error('Not Implemented')
      })
    })
    describe('payload_schemas', () => {
      const schemaA = getTestSchemaName()
      const schemaB = getTestSchemaName()
      const payloadBaseA = getNewPayload()
      payloadBaseA.schema = schemaA
      const payloadA: PayloadWrapper = PayloadWrapper.parse(payloadBaseA)
      const boundWitnessA = BoundWitnessWrapper.parse(getNewBoundWitness([account], [payloadA.payload])[0])
      const payloadBaseB = getNewPayload()
      payloadBaseB.schema = schemaB
      const payloadB: PayloadWrapper = PayloadWrapper.parse(payloadBaseB)
      const boundWitnessB = BoundWitnessWrapper.parse(getNewBoundWitness([account], [payloadB.payload])[0])
      const boundWitnessC = BoundWitnessWrapper.parse(getNewBoundWitness([account], [payloadA.payload, payloadB.payload])[0])
      const boundWitnesses = [boundWitnessA, boundWitnessB, boundWitnessC]
      beforeAll(async () => {
        await archivist.insert(boundWitnesses.map((b) => b.payload))
      })
      const cases: [title: string, payload_schemas: string[], expected: BoundWitnessWrapper[]][] = [
        ['single schema', [schemaA], [boundWitnessA, boundWitnessC]],
        ['single schema', [schemaB], [boundWitnessB, boundWitnessC]],
        ['multiple schemas', [schemaA, schemaB], [boundWitnessA, boundWitnessB, boundWitnessC]],
      ]
      describe.each(cases)('with %s', (_title, payload_schemas, expected) => {
        it('divines BoundWitnesses that contain any of the supplied schemas in payload_schemas', async () => {
          const query: BoundWitnessQueryPayload = { payload_schemas, schema }
          const response = await diviner.divine([query])
          expect(response).toBeArrayOfSize(expected.length)
          const responseHashes = response.map((p) => PayloadWrapper.hash(p))
          expect(responseHashes).toContainAllValues(expected.map((p) => p.hash))
        })
      })
    })
  })
})
