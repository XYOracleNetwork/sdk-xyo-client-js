import { XyoAccount } from '@xyo-network/account'
import { XyoBoundWitnessSchema } from '@xyo-network/boundwitness'
import { XyoDivinerDivineQuery, XyoDivinerDivineQuerySchema } from '@xyo-network/diviner'
import { PayloadWrapper, XyoPayloadBuilder } from '@xyo-network/payload'

import { XyoArchivistApi } from '../../Archivist'
import { XyoApiConfig } from '../../models'
import { XyoRemoteDivinerConfigSchema } from '../XyoRemoteDivinerConfig'
import { XyoRemoteAddressHistoryDiviner } from './XyoRemoteAddressHistoryDiviner'

const configData: XyoApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'https://beta.api.archivist.xyo.network',
  onError: (error) => console.error(`Error: ${JSON.stringify(error)}`),
  onFailure: (response) => response, //console.error(`Failure: ${response.statusText} [${response.status}] [${JSON.stringify(response.data)}]`),
  onSuccess: (response) => response, //console.log(`Success: ${response.statusText} [${response.status}] [${JSON.stringify(response.data)}]`),
}

test('XyoRemoteAddressHistoryDiviner', async () => {
  const address = new XyoAccount({ phrase: 'test' }).addressValue.hex
  const api = new XyoArchivistApi(configData)
  const diviner = new XyoRemoteAddressHistoryDiviner({ api, schema: XyoRemoteDivinerConfigSchema })
  const source = new XyoPayloadBuilder({ schema: 'TODO' }).build()
  const sources = [new PayloadWrapper(source).hash]
  const query: XyoDivinerDivineQuery = {
    schema: XyoDivinerDivineQuerySchema,
    sources,
  }

  const result = await diviner.divine([query, source])
  expect(result.length).toBeGreaterThan(0)
  result.map((bw) => {
    expect(bw.schema).toBe(XyoBoundWitnessSchema)
    expect(bw.addresses).toContain(address)
  })
})
