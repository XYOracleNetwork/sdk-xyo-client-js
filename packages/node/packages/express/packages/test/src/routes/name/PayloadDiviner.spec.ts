import { Account } from '@xyo-network/account'
import { ArchivistWrapper } from '@xyo-network/archivist'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { DivinerWrapper, XyoDivinerDivineQuerySchema } from '@xyo-network/modules'
import { PayloadQueryPayload, PayloadQuerySchema } from '@xyo-network/node-core-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { getArchivist, getDivinerByName, getNewBoundWitness, getNewPayload, unitTestSigningAccount, validateDiscoverResponse } from '../../testUtil'

const moduleName = 'PayloadDiviner'

describe(`/${moduleName}`, () => {
  const account = Account.random()

  const payloadB: PayloadWrapper = PayloadWrapper.parse(getNewPayload())
  const boundWitnessB: BoundWitnessWrapper = BoundWitnessWrapper.parse(getNewBoundWitness(account, [payloadA])[0])
  const payloadC: PayloadWrapper = PayloadWrapper.parse(getNewPayload())
  const boundWitnessC: BoundWitnessWrapper = BoundWitnessWrapper.parse(getNewBoundWitness(account, [payloadA])[0])
  const payloadD: PayloadWrapper = PayloadWrapper.parse(getNewPayload())
  const boundWitnessD: BoundWitnessWrapper = BoundWitnessWrapper.parse(getNewBoundWitness(account, [payloadA])[0])
  const payloadE: PayloadWrapper = PayloadWrapper.parse(getNewPayload())
  const boundWitnessE: BoundWitnessWrapper = BoundWitnessWrapper.parse(getNewBoundWitness(account, [payloadA])[0])

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
    describe('address', () => {
      it('divines Payloads by address', async () => {
        const payload: PayloadWrapper = PayloadWrapper.parse(getNewPayload())
        const boundWitness: BoundWitnessWrapper = BoundWitnessWrapper.parse(getNewBoundWitness(account, [payload])[0])
        await archivist.insert([boundWitness, payload])

        const query: PayloadQueryPayload = {
          address: account.addressValue.hex,
          schema: PayloadQuerySchema,
        }
        const response = await diviner.divine([query])

        expect(response).toBeArray()
        expect(response.length).toBeGreaterThan(0)
      })
      it.skip('divines Payloads by addresses', async () => {
        const query: PayloadQueryPayload = {
          schema: PayloadQuerySchema,
        }
        const response = await diviner.divine([query])
        expect(response).toBeArray()
        expect(response.length).toBeGreaterThan(0)
      })
    })
    describe('hash', () => {
      it.skip('divines Payloads by schema', async (_, _wrapped) => {
        const query: PayloadQueryPayload = {
          schema: PayloadQuerySchema,
        }
        const response = await diviner.divine([query])
        expect(response).toBeArray()
        expect(response.length).toBeGreaterThan(0)
      })
    })
    describe('limit', () => {
      it.skip('divines Payloads by schema', async (_, _wrapped) => {
        const query: PayloadQueryPayload = {
          schema: PayloadQuerySchema,
        }
        const response = await diviner.divine([query])
        expect(response).toBeArray()
        expect(response.length).toBeGreaterThan(0)
      })
    })
    describe('offset', () => {
      it.skip('divines Payloads by schema', async (_, _wrapped) => {
        const query: PayloadQueryPayload = {
          schema: PayloadQuerySchema,
        }
        const response = await diviner.divine([query])
        expect(response).toBeArray()
        expect(response.length).toBeGreaterThan(0)
      })
    })
    describe('order', () => {
      it.skip('divines Payloads by schema', async (_, _wrapped) => {
        const query: PayloadQueryPayload = {
          schema: PayloadQuerySchema,
        }
        const response = await diviner.divine([query])
        expect(response).toBeArray()
        expect(response.length).toBeGreaterThan(0)
      })
    })
    describe('schema', () => {
      it.skip('divines Payloads by schema', async (_, _wrapped) => {
        const query: PayloadQueryPayload = {
          schema: PayloadQuerySchema,
        }
        const response = await diviner.divine([query])
        expect(response).toBeArray()
        expect(response.length).toBeGreaterThan(0)
      })
    })
  })
})
