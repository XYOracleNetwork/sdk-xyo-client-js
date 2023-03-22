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
    describe.skip('address', () => {
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
      beforeAll(async () => {
        await archivist.insert([boundWitnessA.payload, boundWitnessB.payload])
      })
      const cases: [string, BoundWitnessWrapper[]][] = [
        ['single schema', [boundWitnessA]],
        ['multiple schemas', [boundWitnessA, boundWitnessB]],
      ]
      describe.each(cases)('with %s', (_schema, boundWitnesses) => {
        it('divines BoundWitnesses by payload_schemas', async () => {
          const payload_schemas = boundWitnesses.map((p) => p.payloadSchemas).flat()
          const query: BoundWitnessQueryPayload = { payload_schemas, schema }
          const response = await diviner.divine([query])
          expect(response).toBeArrayOfSize(boundWitnesses.length)
          const responseHashes = response.map((p) => PayloadWrapper.hash(p))
          expect(responseHashes).toContainAllValues(boundWitnesses.map((p) => p.hash))
        })
      })
    })
  })
})
