import { Account } from '@xyo-network/account'
import { XyoApiConfig, XyoApiError } from '@xyo-network/api-models'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness'

import { XyoArchivistApi } from '../Api'
import { getNewArchive, getTimestampMinutesFromNow } from '../ApiUtil.spec'

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
      expect(archive).toBeTruthy()
    })
    describe('when order is ascending', () => {
      it('returns payloads greater than or equal to timestamp', async () => {
        try {
          const timestamp = getTimestampMinutesFromNow(-1)
          const [boundWitness] = new BoundWitnessBuilder().witness(Account.random()).build()
          const blockResult = await api.archive(archive).block.post([boundWitness])
          expect(blockResult?.length).toBe(1)
          const response = await api.archive(archive).block.find({ order: 'asc', timestamp })
          expect(response?.length).toBe(1)
        } catch (ex) {
          const error = ex as XyoApiError
          console.log(JSON.stringify(error.response?.data, null, 2))
          expect(error === undefined)
        }
      })
    })
    describe('when order is descending', () => {
      it('returns payloads less than or equal to timestamp', async () => {
        try {
          const [boundWitness] = new BoundWitnessBuilder().witness(Account.random()).build()
          const blockResult = await api.archive(archive).block.post([boundWitness])
          expect(blockResult?.length).toBe(1)
          const timestamp = getTimestampMinutesFromNow(1)
          const response = await api.archive(archive).block.find({ order: 'desc', timestamp })
          expect(response?.length).toBe(1)
        } catch (ex) {
          const error = ex as XyoApiError
          console.log(JSON.stringify(error.response?.data, null, 2))
          expect(error === undefined)
        }
      })
    })
  })
})
