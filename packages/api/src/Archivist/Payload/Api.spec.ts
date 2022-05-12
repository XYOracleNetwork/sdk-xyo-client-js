import { config } from 'dotenv'

import { XyoAccount, XyoBoundWitnessBuilder } from '../../../core'
import { XyoApiConfig, XyoApiError } from '../../models'
import { XyoArchivistApi } from '../Api'
import { getNewArchive } from '../ApiUtil.spec'

config()

const configData: XyoApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'https://beta.api.archivist.xyo.network',
  onError: (error) => console.error(`Error: ${JSON.stringify(error)}`),
  onFailure: (response) => response, //console.error(`Failure: ${response.statusText} [${response.status}] [${JSON.stringify(response.data)}]`),
  onSuccess: (response) => response, //console.log(`Success: ${response.statusText} [${response.status}] [${JSON.stringify(response.data)}]`),
}

describe('XyoArchivistPayloadApi', () => {
  describe('find', () => {
    const api = new XyoArchivistApi(configData)
    let archive = ''
    beforeEach(async () => {
      archive = await getNewArchive(api)
    })
    describe('when order is ascending', () => {
      it('returns payloads greater than or equal to timestamp', async () => {
        try {
          const timestamp = Date.now()
          const boundWitness = new XyoBoundWitnessBuilder().witness(XyoAccount.random()).build()
          await api.archive(archive).block.post([boundWitness])
          const response = await api.archive(archive).block.find({ order: 'asc', timestamp })
          expect(response?.length).toBe(1)
          const actual = response?.[0]
          expect(actual?._timestamp).toBeTruthy()
          expect(actual?._timestamp).toBeGreaterThan(timestamp)
        } catch (ex) {
          const error = ex as XyoApiError
          console.log(JSON.stringify(error.response?.data, null, 2))
          throw ex
        }
      })
    })
    describe('when order is descending', () => {
      it('returns payloads less than or equal to timestamp', async () => {
        try {
          const boundWitness = new XyoBoundWitnessBuilder().witness(XyoAccount.random()).build()
          await api.archive(archive).block.post([boundWitness])
          const timestamp = Date.now()
          const response = await api.archive(archive).block.find({ order: 'desc', timestamp })
          expect(response?.length).toBe(1)
          const actual = response?.[0]
          expect(actual?._timestamp).toBeTruthy()
          expect(actual?._timestamp).toBeLessThanOrEqual(timestamp)
        } catch (ex) {
          const error = ex as XyoApiError
          console.log(JSON.stringify(error.response?.data, null, 2))
          throw ex
        }
      })
    })
  })
})
