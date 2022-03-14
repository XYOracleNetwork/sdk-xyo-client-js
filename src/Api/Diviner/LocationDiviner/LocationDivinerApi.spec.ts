import { ApiConfig } from '@xylabs/sdk-js'
import { AxiosError } from 'axios'

import { XyoArchivistApiConfig } from '../../Archivist'
import { XyoLocationDivinerApi } from './LocationDivinerApi'
import {
  LocationHeatmapQueryCreationRequest,
  locationHeatmapQuerySchema,
  LocationTimeRangeQueryCreationRequest,
  locationTimeRangeQuerySchema,
} from './Queries'
import { locationWitnessPayloadSchema } from './Witnesses'

const config: ApiConfig = {
  apiDomain: process.env.LOCATION_API_DOMAIN || 'http://localhost:8082',
}

const getArchiveConfig = (): XyoArchivistApiConfig => {
  const apiDomain = process.env.API_DOMAIN || 'http://localhost:8080'
  const archive = process.env.ARCHIVE || 'temp'
  return { apiDomain, archive }
}

const getDefaultStartStopTime = () => {
  const startTime = new Date(0).toISOString()
  const stopTime = new Date().toISOString()
  return { startTime, stopTime }
}

const getLocationTimeRangeQueryCreationRequest = (): LocationTimeRangeQueryCreationRequest => {
  const query = { schema: locationWitnessPayloadSchema, ...getDefaultStartStopTime() }
  const sourceArchive = { ...getArchiveConfig() }
  const resultArchive = { ...getArchiveConfig() }
  return { query, resultArchive, schema: locationTimeRangeQuerySchema, sourceArchive }
}

const getLocationHeatmapQueryCreationRequest = (): LocationHeatmapQueryCreationRequest => {
  const query = { schema: locationWitnessPayloadSchema, ...getDefaultStartStopTime() }
  const sourceArchive = { ...getArchiveConfig() }
  const resultArchive = { ...getArchiveConfig() }
  return { query, resultArchive, schema: locationHeatmapQuerySchema, sourceArchive }
}

const describeSkipIfNoDiviner = process.env.LOCATION_API_DOMAIN ? describe : describe.skip

describeSkipIfNoDiviner('XyoLocationDivinerApi', () => {
  describe('constructor', () => {
    it('returns a new XyoLocationDivinerApi', () => {
      const api = new XyoLocationDivinerApi(config)
      expect(api).toBeDefined()
    })
  })
  describe('postLocationQuery', () => {
    it('posts a location heatmap query', async () => {
      const api = new XyoLocationDivinerApi(config)
      try {
        const locationQuery = await api.postLocationQuery(getLocationHeatmapQueryCreationRequest())
        const response = await api.getLocationQuery(locationQuery.hash)
        expect(response.queryHash).toBe(locationQuery.hash)
      } catch (ex) {
        const error = ex as AxiosError
        console.log(JSON.stringify(error.response?.data, null, 2))
        throw ex
      }
    })
    it('posts a location time range query', async () => {
      const api = new XyoLocationDivinerApi(config)
      try {
        const locationQuery = await api.postLocationQuery(getLocationTimeRangeQueryCreationRequest())
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
        const locationQuery = await api.postLocationQuery(getLocationTimeRangeQueryCreationRequest())
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
