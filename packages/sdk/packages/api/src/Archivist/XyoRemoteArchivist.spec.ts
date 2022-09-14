import { XyoPayloadWrapper } from '@xyo-network/payload'

import { XyoApiConfig } from '../models'
import { XyoArchivistApi } from './Api'
import { XyoRemoteArchivist } from './XyoRemoteArchivist'
import { XyoRemoteArchivistConfigSchema } from './XyoRemoteArchivistConfig'

const configData: XyoApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'https://beta.api.archivist.xyo.network',
  onError: (error) => console.error(`Error: ${JSON.stringify(error)}`),
  onFailure: (response) => response, //console.error(`Failure: ${response.statusText} [${response.status}] [${JSON.stringify(response.data)}]`),
  onSuccess: (response) => response, //console.log(`Success: ${response.statusText} [${response.status}] [${JSON.stringify(response.data)}]`),
}

test('XyoRemoteArchivist', async () => {
  const api = new XyoArchivistApi(configData)
  const archivist = new XyoRemoteArchivist({ api, schema: XyoRemoteArchivistConfigSchema })
  const payload = {
    salt: `${Math.random() * 10000}`,
    schema: 'network.xyo.id',
  }
  const result = await archivist.insert([payload])
  expect(result.payload_hashes.length).toBe(1)
  const getResult = await archivist.get([new XyoPayloadWrapper(payload).hash])
  console.log(`getResult: ${JSON.stringify(getResult)}`)
  expect(getResult.length).toBe(1)
  expect(getResult[0]?.schema).toBe(payload.schema)
})
