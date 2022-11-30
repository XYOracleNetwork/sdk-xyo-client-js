import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { XyoApiConfig, XyoApiResponseBody } from '@xyo-network/api-models'
import { BoundWitnessWrapper, XyoBoundWitness } from '@xyo-network/boundwitness'
import { ModuleDescription } from '@xyo-network/module'

import { XyoApiSimple } from '../../../Simple'
import { XyoArchivistApi } from '../../Api'
import { XyoAddressesApi } from '../Api'
import { XyoAddressApi } from './Api'

const config: XyoApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'http://localhost:8080',
}

describe('XyoAddressApi', () => {
  describe('get', () => {
    let api: XyoAddressApi
    let result: XyoApiResponseBody<ModuleDescription>
    beforeAll(async () => {
      const address = assertEx((await new XyoAddressesApi(config).get())?.children?.pop()?.address)
      api = new XyoArchivistApi(config).addresses.address(address)
      result = await api.get()
      expect(result).toBeObject()
    })
    it('method exists', () => {
      expect(api).toBeDefined()
      expect(api.get).toBeFunction()
    })
    describe('returns module', () => {
      it('address', () => {
        expect(result?.address).toBeString()
      })
      it('supported queries', () => {
        const queries = result?.queries
        expect(queries).toBeArray()
        expect(queries?.length).toBeGreaterThan(0)
        queries?.map((query) => {
          expect(query).toBeString()
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
