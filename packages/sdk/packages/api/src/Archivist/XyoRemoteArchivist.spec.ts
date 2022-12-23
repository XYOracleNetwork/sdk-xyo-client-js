import { XyoApiConfig } from '@xyo-network/api-models'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { XyoBoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { IdSchema } from '@xyo-network/plugins'

import { XyoArchivistApi } from '../Api'
import { XyoRemoteArchivist } from './XyoRemoteArchivist'
import { XyoRemoteArchivistConfigSchema } from './XyoRemoteArchivistConfig'

const configData: XyoApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'http://locahost:8080',
  onError: (error) => error,
  onFailure: (response) => response,
  onSuccess: (response) => response,
}

const payload = {
  salt: `${Math.random() * 10000}`,
  schema: IdSchema,
}

describe('XyoRemoteArchivist', () => {
  let archivist: XyoRemoteArchivist
  let wrapper: ArchivistWrapper

  beforeEach(async () => {
    const api = new XyoArchivistApi(configData)
    archivist = await XyoRemoteArchivist.create({ config: { api, schema: XyoRemoteArchivistConfigSchema } })
    wrapper = new ArchivistWrapper(archivist)
  })

  it('get return payloads', async () => {
    const result = (await archivist.insert([payload])).pop()
    expect(result?.payload_hashes.length).toBe(1)
    const getResult = await archivist.get([new PayloadWrapper(payload).hash])
    expect(getResult.length).toBe(1)
    expect(getResult[0]?.schema).toBe(payload.schema)

    const findResult = await wrapper.find()
    expect(findResult.length).toBe(20)
  })

  it('get returns boundwitness', async () => {
    const payload = {
      payload_hashes: ['123456'],
      payload_schemas: [IdSchema],
      schema: XyoBoundWitnessSchema,
    }

    await archivist.insert([payload])
    const getResult = await archivist.get([new PayloadWrapper(payload).hash])
    expect(getResult?.[0].schema).toBe(XyoBoundWitnessSchema)
  })
})
