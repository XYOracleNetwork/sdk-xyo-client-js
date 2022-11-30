import { XyoApiConfig } from '@xyo-network/api-models'
import { AxiosError } from 'axios'

import { ApiConfig } from './ApiConfig'
import { XyoLocationDivinerApi } from './LocationDivinerApi'
import {
  LocationHeatmapQueryCreationRequest,
  locationHeatmapQuerySchema,
  LocationTimeRangeQueryCreationRequest,
  LocationTimeRangeQuerySchema,
} from './Queries'
import { LocationWitnessSchema } from './Witnesses'

const config: ApiConfig = {
  apiDomain: process.env.LOCATION_API_DOMAIN || 'http://localhost:8082',
}

const getArchiveConfig = (): XyoApiConfig => {
  const apiDomain = process.env.API_DOMAIN || 'http://localhost:8080'
  return { apiDomain }
}

const getDefaultStartStopTime = () => {
  const startTime = new Date(0).toISOString()
  const stopTime = new Date().toISOString()
  return { startTime, stopTime }
}

const getLocationTimeRangeQueryCreationRequest = (): LocationTimeRangeQueryCreationRequest => {
  const query = { schema: LocationWitnessSchema, ...getDefaultStartStopTime() }
  const sourceArchivist = { ...getArchiveConfig() }
  const resultArchivist = { ...getArchiveConfig() }
  return {
    query,
    resultArchive: 'temp',
    resultArchivist,
    schema: LocationTimeRangeQuerySchema,
    sourceArchive: 'temp',
    sourceArchivist,
  }
}

const getLocationHeatmapQueryCreationRequest = (): LocationHeatmapQueryCreationRequest => {
  const query = { schema: LocationWitnessSchema, ...getDefaultStartStopTime() }
  const sourceArchivist = { ...getArchiveConfig() }
  const resultArchivist = { ...getArchiveConfig() }
  return {
    query,
    resultArchive: 'temp',
    resultArchivist,
    schema: locationHeatmapQuerySchema,
    sourceArchive: 'temp',
    sourceArchivist,
  }
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
      const locationQuery = await api.postLocationQuery(getLocationHeatmapQueryCreationRequest())
      const response = await api.getLocationQuery(locationQuery.hash)
      expect(response.queryHash).toBe(locationQuery.hash)
    })
    it('posts a location time range query', async () => {
      const api = new XyoLocationDivinerApi(config)
      const locationQuery = await api.postLocationQuery(getLocationTimeRangeQueryCreationRequest())
      const response = await api.getLocationQuery(locationQuery.hash)
      expect(response.queryHash).toBe(locationQuery.hash)
    })
  })
  describe('getLocationQuery', function () {
    it('gets the status of a previously posted location query', async () => {
      const api = new XyoLocationDivinerApi(config)
      const locationQuery = await api.postLocationQuery(getLocationTimeRangeQueryCreationRequest())
      const response = await api.getLocationQuery(locationQuery.hash)
      expect(response.queryHash).toBe(locationQuery.hash)
    })
  })
})
