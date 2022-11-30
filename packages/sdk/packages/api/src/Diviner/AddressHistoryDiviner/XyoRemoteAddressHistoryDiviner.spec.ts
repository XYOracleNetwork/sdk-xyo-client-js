import { Account } from '@xyo-network/account'
import { XyoApiConfig } from '@xyo-network/api-models'
import { BoundWitnessWrapper, XyoBoundWitness, XyoBoundWitnessSchema } from '@xyo-network/boundwitness'
import { AddressHistoryQuerySchema, DivinerWrapper } from '@xyo-network/diviner'
import { XyoPayloadBuilder } from '@xyo-network/payload'

import { XyoArchivistApi } from '../../Api'
import { XyoRemoteDivinerConfigSchema } from '../XyoRemoteDivinerConfig'
import { XyoRemoteAddressHistoryDiviner } from './XyoRemoteAddressHistoryDiviner'

const configData: XyoApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'http://locahost:8080',
  onError: (error) => console.error(`Error: ${JSON.stringify(error)}`),
  onFailure: (response) => response, //console.error(`Failure: ${response.statusText} [${response.status}] [${JSON.stringify(response.data)}]`),
  onSuccess: (response) => response, //console.log(`Success: ${response.statusText} [${response.status}] [${JSON.stringify(response.data)}]`),
}

describe('XyoRemoteAddressHistoryDiviner', () => {
  const address = new Account({ phrase: 'test' }).addressValue.hex
  const api = new XyoArchivistApi(configData)
  let diviner: XyoRemoteAddressHistoryDiviner
  beforeAll(async () => {
    diviner = await XyoRemoteAddressHistoryDiviner.create({ config: { api, schema: XyoRemoteDivinerConfigSchema } })
  })

  describe('with valid address returns', () => {
    let result: XyoBoundWitness[]
    beforeAll(async () => {
      const source = new XyoPayloadBuilder({ schema: AddressHistoryQuerySchema }).fields({ address }).build()
      result = (await new DivinerWrapper(diviner).divine([source])) as XyoBoundWitness[]
      expect(result.length).toBeGreaterThan(0)
    })
    it('array of Bound Witnesses', () => {
      result.map((bw) => {
        expect(bw.schema).toBe(XyoBoundWitnessSchema)
      })
    })
    it('from address', () => {
      expect(result.length).toBeGreaterThan(0)
      result.map((bw) => {
        expect(bw.addresses).toContain(address)
      })
    })
  })
  describe('with hash offset returns', () => {
    let result: XyoBoundWitness[]
    let hash: string
    beforeAll(async () => {
      let source = new XyoPayloadBuilder({ schema: AddressHistoryQuerySchema }).fields({ address }).build()
      result = (await new DivinerWrapper(diviner).divine([source])) as XyoBoundWitness[]
      expect(result.length).toBeGreaterThan(0)
      hash = new BoundWitnessWrapper(result?.[0]).hash
      source = new XyoPayloadBuilder({ schema: AddressHistoryQuerySchema }).fields({ address, offset: hash }).build()
      result = (await new DivinerWrapper(diviner).divine([source])) as XyoBoundWitness[]
      expect(result.length).toBeGreaterThan(0)
    })
    it('results starting at hash', () => {
      expect(new BoundWitnessWrapper(result?.[0]).hash).toBe(hash)
    })
  })
  describe('with limit returns', () => {
    const limit = 1
    let result: XyoBoundWitness[]
    beforeAll(async () => {
      const source = new XyoPayloadBuilder({ schema: AddressHistoryQuerySchema }).fields({ address, limit }).build()
      result = (await new DivinerWrapper(diviner).divine([source])) as XyoBoundWitness[]
      expect(result.length).toBeGreaterThan(0)
    })
    it('number of results specified by the limit', () => {
      expect(result.length).toBe(limit)
    })
  })
  describe('with non-existent address', () => {
    it('returns empty array', async () => {
      const source = new XyoPayloadBuilder({ schema: AddressHistoryQuerySchema }).fields({ address: 'foo' }).build()
      const result = await new DivinerWrapper(diviner).divine([source])
      expect(result.length).toBe(0)
    })
  })
})
