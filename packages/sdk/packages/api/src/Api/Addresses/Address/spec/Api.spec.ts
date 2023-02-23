import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { XyoApiConfig, XyoApiResponseBody } from '@xyo-network/api-models'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { XyoPayload } from '@xyo-network/payload-model'
import { QueryPayload, QuerySchema } from '@xyo-network/query-payload-plugin'

import { XyoApiSimple } from '../../../../Simple'
import { XyoArchivistApi } from '../../../Api'
import { XyoAddressesApi } from '../../Api'
import { XyoAddressApi } from '../Api'

const config: XyoApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'http://localhost:8080',
}

describe('XyoAddressApi', () => {
  describe('get', () => {
    let api: XyoAddressApi
    let result: XyoApiResponseBody<XyoPayload[]>
    beforeAll(async () => {
      const payloads = await new XyoAddressesApi(config).get()
      expect(payloads).toBeArray()
      const addressPayload = payloads?.find((p) => p.schema === AddressSchema) as AddressPayload
      expect(addressPayload).toBeObject()
      const address = addressPayload.address
      api = new XyoArchivistApi(config).addresses.address(address)
      result = await api.get()
      expect(result).toBeArray()
    })
    it('method exists', () => {
      expect(api).toBeDefined()
      expect(api.get).toBeFunction()
    })
    describe('returns module', () => {
      it('address', () => {
        const addressPayload = result?.find((p) => p.schema === AddressSchema) as AddressPayload
        expect(addressPayload).toBeObject()
        const address = addressPayload.address
        expect(address).toBeString()
      })
      it('supported queries', () => {
        const queryPayloads = result?.filter((p) => p.schema === QuerySchema) as QueryPayload[]
        expect(queryPayloads).toBeArray()
        expect(queryPayloads.length).toBeGreaterThan(0)
        queryPayloads?.map((query) => {
          expect(query.query).toBeString()
        })
      })
    })
  })
  describe('boundWitness', () => {
    let address: string
    let api: XyoApiSimple<XyoBoundWitness[]>
    let history: XyoBoundWitness[]
    beforeAll(async () => {
      address = new Account({ phrase: 'test' }).addressValue.hex
      api = new XyoArchivistApi(config).addresses.address(address).boundWitnesses
      const result = await api.get()
      expect(result).toBeArray()
      history = assertEx(result)
    })
    it('method exists', () => {
      expect(api).toBeDefined()
      expect(api.get).toBeFunction()
    })
    describe('return BoundWitnesses', () => {
      it('from the address specified', () => {
        history?.map((block) => expect(block.addresses).toContain(address))
      })
      it('in sequential order', () => {
        verifyBlockChainHistory(history)
      })
    })
  })
})

const verifyBlockChainHistory = (history: XyoBoundWitness[]) => {
  for (let i = 1; i < history.length; i++) {
    const current = history[i - 1]
    const previous = history[i]
    expect(current.previous_hashes).toContain(new BoundWitnessWrapper(previous).hash)
  }
}
