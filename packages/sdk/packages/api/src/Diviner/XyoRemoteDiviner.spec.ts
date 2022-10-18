import { XyoArchivistApi } from '../Archivist'
import { XyoApiConfig } from '../models'
import { XyoRemoteDiviner } from './XyoRemoteDiviner'
import { XyoRemoteDivinerConfigSchema } from './XyoRemoteDivinerConfig'

const configData: XyoApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'https://beta.api.archivist.xyo.network',
  onError: (error) => console.error(`Error: ${JSON.stringify(error)}`),
  onFailure: (response) => response, //console.error(`Failure: ${response.statusText} [${response.status}] [${JSON.stringify(response.data)}]`),
  onSuccess: (response) => response, //console.log(`Success: ${response.statusText} [${response.status}] [${JSON.stringify(response.data)}]`),
}

test('XyoRemoteDiviner', async () => {
  const api = new XyoArchivistApi(configData)
  const diviner = new XyoRemoteDiviner({ api, schema: XyoRemoteDivinerConfigSchema })
  const payload = {
    salt: `${Math.random() * 10000}`,
    schema: 'network.xyo.id',
  }
  const result = await diviner.divine([payload])
  expect(result?.length).toBe(1)
  const getResult = await diviner.divine([payload])
  console.log(`getResult: ${JSON.stringify(getResult)}`)
  expect(getResult.length).toBe(1)
  expect(getResult[0]?.schema).toBe(payload.schema)
})
