import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { DivinerWrapper, XyoDivinerDivineQuerySchema } from '@xyo-network/modules'
import { PayloadQueryPayload, PayloadQuerySchema } from '@xyo-network/node-core-model'
import { PayloadWrapper, PayloadWrapperBase } from '@xyo-network/payload-wrapper'

import { getDivinerByName, getNewBoundWitness, getNewPayload, unitTestSigningAccount, validateDiscoverResponse } from '../../testUtil'

const moduleName = 'PayloadDiviner'

describe(`/${moduleName}`, () => {
  const account = unitTestSigningAccount

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

  let diviner: DivinerWrapper

  beforeAll(async () => {
    diviner = await getDivinerByName(moduleName)
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
      it.skip('divines Payloads by address', async (_, _wrapped) => {
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
