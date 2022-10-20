import { XyoAccount } from '@xyo-network/account'
import { XyoBoundWitness, XyoBoundWitnessSchema } from '@xyo-network/boundwitness'
import { XyoDivinerWrapper } from '@xyo-network/diviner'
import { XyoPayloadBuilder } from '@xyo-network/payload'

import { XyoArchivistApi } from '../../Archivist'
import { XyoApiConfig } from '../../models'
import { XyoRemoteDivinerConfigSchema } from '../XyoRemoteDivinerConfig'
import { AddressHistoryQuerySchema } from './AddressHistoryDiviner'
import { XyoRemoteAddressHistoryDiviner } from './XyoRemoteAddressHistoryDiviner'

const configData: XyoApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'https://beta.api.archivist.xyo.network',
  onError: (error) => console.error(`Error: ${JSON.stringify(error)}`),
  onFailure: (response) => response, //console.error(`Failure: ${response.statusText} [${response.status}] [${JSON.stringify(response.data)}]`),
  onSuccess: (response) => response, //console.log(`Success: ${response.statusText} [${response.status}] [${JSON.stringify(response.data)}]`),
}

describe('XyoRemoteAddressHistoryDiviner', () => {
  const address = new XyoAccount({ phrase: 'test' }).addressValue.hex
  const api = new XyoArchivistApi(configData)
  const diviner = new XyoRemoteAddressHistoryDiviner({ api, schema: XyoRemoteDivinerConfigSchema })

  describe('with valid address returns', () => {
    let result: XyoBoundWitness[]
    beforeAll(async () => {
      const source = new XyoPayloadBuilder({ schema: AddressHistoryQuerySchema }).fields({ address }).build()
      result = (await new XyoDivinerWrapper(diviner).divine([source])) as XyoBoundWitness[]
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
  describe('with non-existent address', () => {
    it('returns empty array', async () => {
      const source = new XyoPayloadBuilder({ schema: AddressHistoryQuerySchema }).fields({ address: 'foo' }).build()
      const result = await new XyoDivinerWrapper(diviner).divine([source])
      expect(result.length).toBe(0)
    })
  })
})
