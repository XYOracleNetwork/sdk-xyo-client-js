import { ApiConfig } from '@xylabs/sdk-js'
import { AxiosError } from 'axios'

import { XyoLocationDivinerApi } from './LocationDivinerApi'

const config: ApiConfig = {
  apiDomain: process.env.LOCATION_API_DOMAIN || 'http://localhost:8082',
}

const getLocationQuery = () => {
  const startTime = new Date(0).toISOString()
  const stopTime = new Date().toISOString()
  const apiDomain = process.env.API_DOMAIN || 'http://localhost:8080'
  const archive = process.env.ARCHIVE || 'temp'
  const schema = 'location.diviner.xyo.network'
  return {
    query: { schema, startTime, stopTime },
    resultArchive: { apiDomain, archive },
    sourceArchive: { apiDomain, archive },
  }
}

describe('XyoLocationDivinerApi', () => {
  describe('constructor', () => {
    it('returns a new XyoLocationDivinerApi', () => {
      const api = new XyoLocationDivinerApi(config)
      expect(api).toBeDefined()
    })
  })
  describe('postLocationQuery', () => {
    it('posts a location query', async () => {
      const api = new XyoLocationDivinerApi(config)
      try {
        const locationQuery = await api.postLocationQuery(getLocationQuery())
        const response = await api.getLocationQuery(locationQuery.hash)
        expect(response.queryHash).toBe(locationQuery.hash)
      } catch (ex) {
        const error = ex as AxiosError
        console.log(JSON.stringify(error.response?.data, null, 2))
        throw ex
      }
    })
  })
  describe('getLocationQuery', function () {
    it('gets the status of a previously posted location query', async () => {
      const api = new XyoLocationDivinerApi(config)
      try {
        const locationQuery = await api.postLocationQuery(getLocationQuery())
        const response = await api.getLocationQuery(locationQuery.hash)
        expect(response.queryHash).toBe(locationQuery.hash)
      } catch (ex) {
        const error = ex as AxiosError
        console.log(JSON.stringify(error.response?.data, null, 2))
        throw ex
      }
    })
  })
})
