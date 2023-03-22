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

        const query: PayloadQueryPayload = {
          address: accountA.addressValue.hex,
          schema: PayloadQuerySchema,
        }
        const response = await diviner.divine([query])

        expect(response).toBeArray()
        expect(response.length).toBeGreaterThan(0)
      })
      it.skip('divines Payloads by addresses', async () => {
        const payload: PayloadWrapper = PayloadWrapper.parse(getNewPayload())
        const boundWitness: BoundWitnessWrapper = BoundWitnessWrapper.parse(getNewBoundWitness([accountA, accountB], [payload])[0])
        await archivist.insert([boundWitness.payload, payload.payload])
        const address = [accountA.addressValue.hex, accountB.addressValue.hex] as unknown as (string | string[]) & (string | [string])
        const query: PayloadQueryPayload = {
          address: address,
          schema: PayloadQuerySchema,
        }
        const response = await diviner.divine([query])

        expect(response).toBeArray()
        expect(response.length).toBeGreaterThan(0)
      })
    })
    describe('hash', () => {
      it.skip('divines Payloads by schema', async () => {
        const query: PayloadQueryPayload = {
          schema: PayloadQuerySchema,
        }
        const response = await diviner.divine([query])
        expect(response).toBeArray()
        expect(response.length).toBeGreaterThan(0)
      })
    })
    describe('limit', () => {
      it.skip('divines Payloads by schema', async () => {
        const query: PayloadQueryPayload = {
          schema: PayloadQuerySchema,
        }
        const response = await diviner.divine([query])
        expect(response).toBeArray()
        expect(response.length).toBeGreaterThan(0)
      })
    })
    describe('offset', () => {
      it.skip('divines Payloads by schema', async () => {
        const query: PayloadQueryPayload = {
          schema: PayloadQuerySchema,
        }
        const response = await diviner.divine([query])
        expect(response).toBeArray()
        expect(response.length).toBeGreaterThan(0)
      })
    })
    describe('order', () => {
      it.skip('divines Payloads by schema', async () => {
        const query: PayloadQueryPayload = {
          schema: PayloadQuerySchema,
        }
        const response = await diviner.divine([query])
        expect(response).toBeArray()
        expect(response.length).toBeGreaterThan(0)
      })
    })
    describe('schema', () => {
      describe('with single schema', () => {
        const schema = getTestSchemaName()
        const schemas = [schema]
        const payloadBase = getNewPayload()
        payloadBase.schema = schema
        const payload: PayloadWrapper = PayloadWrapper.parse(payloadBase)
        const payloads = [payload]
        beforeAll(async () => {
          await archivist.insert([payload.payload])
        })
        it('divines Payload by schema', async () => {
          const query: PayloadQueryPayload = { schema: PayloadQuerySchema, schemas }
          const response = await diviner.divine([query])
          expect(response).toBeArrayOfSize(payloads.length)
          const responseHashes = response.map((p) => PayloadWrapper.hash(p))
          expect(responseHashes).toContainAllValues(payloads.map((p) => p.hash))
        })
      })
      describe('with multiple schemas', () => {
        const schemaA = getTestSchemaName()
        const schemaB = getTestSchemaName()
        const schemas = [schemaA, schemaB]
        const payloadBaseA = getNewPayload()
        payloadBaseA.schema = schemaA
        const payloadA: PayloadWrapper = PayloadWrapper.parse(payloadBaseA)
        const payloadBaseB = getNewPayload()
        payloadBaseB.schema = schemaA
        const payloadB: PayloadWrapper = PayloadWrapper.parse(payloadBaseB)
        const payloads = [payloadA, payloadB]
        beforeAll(async () => {
          await archivist.insert([payloadA.payload, payloadB.payload])
        })
        it('divines Payload by schema', async () => {
          const query: PayloadQueryPayload = { schema: PayloadQuerySchema, schemas }
          const response = await diviner.divine([query])
          expect(response).toBeArrayOfSize(payloads.length)
          const responseHashes = response.map((p) => PayloadWrapper.hash(p))
          expect(responseHashes).toContainAllValues(payloads.map((p) => p.hash))
        })
      })
    })
  })
})
