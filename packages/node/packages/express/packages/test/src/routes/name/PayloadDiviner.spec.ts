import { Account } from '@xyo-network/account'
import { ArchivistWrapper } from '@xyo-network/archivist'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { DivinerWrapper, XyoDivinerDivineQuerySchema } from '@xyo-network/modules'
import { PayloadQueryPayload, PayloadQuerySchema } from '@xyo-network/node-core-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import {
  getArchivist,
  getDivinerByName,
  getNewBoundWitness,
  getNewPayload,
  getTestSchemaName,
  unitTestSigningAccount,
  validateDiscoverResponse,
} from '../../testUtil'

const schema = PayloadQuerySchema
const nonExistentHash = '4b19d691dd348c711b2e83ed975c8009856e3001a84cdc63b5226124e08eb4af'

const moduleName = 'PayloadDiviner'
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
    describe.skip('address', () => {
      it('divines Payloads by address', async () => {
        const payload: PayloadWrapper = PayloadWrapper.parse(getNewPayload())
        const boundWitness: BoundWitnessWrapper = BoundWitnessWrapper.parse(getNewBoundWitness([accountA], [payload])[0])
        await archivist.insert([boundWitness.payload, payload.payload])

        const address = accountA.addressValue.hex
        const query: PayloadQueryPayload = { address, schema }
        const response = await diviner.divine([query])

        expect(response).toBeArray()
        expect(response.length).toBeGreaterThan(0)
      })
      it.skip('divines Payloads by addresses', async () => {
        const payload: PayloadWrapper = PayloadWrapper.parse(getNewPayload())
        const boundWitness: BoundWitnessWrapper = BoundWitnessWrapper.parse(getNewBoundWitness([accountA, accountB], [payload])[0])
        await archivist.insert([boundWitness.payload, payload.payload])
        const address = [accountA.addressValue.hex, accountB.addressValue.hex] as unknown as (string | string[]) & (string | [string])
        const query: PayloadQueryPayload = { address: address, schema }
        const response = await diviner.divine([query])
        expect(response).toBeArray()
        expect(response.length).toBeGreaterThan(0)
      })
    })
    describe('hash', () => {
      const payload: PayloadWrapper = PayloadWrapper.parse(getNewPayload())
      beforeAll(async () => await archivist.insert([payload.payload]))
      it('divines Payloads by hash', async () => {
        const hash = payload.hash
        const query: PayloadQueryPayload = { hash, schema }
        const response = await diviner.divine([query])
        expect(response).toBeArrayOfSize(0)
      })
      it('returns empty array for non-existent hash', async () => {
        const hash = nonExistentHash
        const query: PayloadQueryPayload = { hash, schema }
        const response = await diviner.divine([query])
        expect(response).toBeArrayOfSize(1)
        const responseHashes = response.map((p) => PayloadWrapper.hash(p))
        expect(responseHashes).toContainAllValues([payload.hash])
      })
    })
    describe('limit', () => {
      const schemaA = getTestSchemaName()
      const schemaB = getTestSchemaName()
      const payloadBaseA = getNewPayload()
      payloadBaseA.schema = schemaA
      const payloadA: PayloadWrapper = PayloadWrapper.parse(payloadBaseA)
      const payloadBaseB = getNewPayload()
      payloadBaseB.schema = schemaB
      const payloadB: PayloadWrapper = PayloadWrapper.parse(payloadBaseB)
      beforeAll(async () => {
        await archivist.insert([payloadA.payload, payloadB.payload])
      })
      it.each([1, 2])('returns the specified number of Payloads', async (limit) => {
        const query: PayloadQueryPayload = { limit, schema }
        const response = await diviner.divine([query])
        expect(response).toBeArrayOfSize(limit)
      })
    })
    describe('offset', () => {
      it.skip('divines Payloads from offset', async () => {
        const query: PayloadQueryPayload = { schema }
        const response = await diviner.divine([query])
        expect(response).toBeArray()
        expect(response.length).toBeGreaterThan(0)
      })
    })
    describe('order', () => {
      it.skip('divines Payloads in order', async () => {
        const query: PayloadQueryPayload = { schema }
        const response = await diviner.divine([query])
        expect(response).toBeArray()
        expect(response.length).toBeGreaterThan(0)
      })
    })
    describe('schema', () => {
      const schemaA = getTestSchemaName()
      const schemaB = getTestSchemaName()
      const payloadBaseA = getNewPayload()
      payloadBaseA.schema = schemaA
      const payloadA: PayloadWrapper = PayloadWrapper.parse(payloadBaseA)
      const payloadBaseB = getNewPayload()
      payloadBaseB.schema = schemaB
      const payloadB: PayloadWrapper = PayloadWrapper.parse(payloadBaseB)
      beforeAll(async () => {
        await archivist.insert([payloadA.payload, payloadB.payload])
      })
      const cases: [string, PayloadWrapper[]][] = [
        ['single schema', [payloadA]],
        ['multiple schemas', [payloadA, payloadB]],
      ]
      describe.each(cases)('with %s', (_schema, payloads) => {
        it('divines Payloads by schema', async () => {
          const schemas = payloads.map((p) => p.schema)
          const query: PayloadQueryPayload = { schema, schemas }
          const response = await diviner.divine([query])
          expect(response).toBeArrayOfSize(payloads.length)
          const responseHashes = response.map((p) => PayloadWrapper.hash(p))
          expect(responseHashes).toContainAllValues(payloads.map((p) => p.hash))
        })
      })
    })
  })
})
