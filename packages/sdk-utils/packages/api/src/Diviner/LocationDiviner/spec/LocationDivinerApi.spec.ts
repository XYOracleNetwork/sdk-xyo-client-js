import '@xylabs/vitest-extended'

import type { ApiConfig } from '@xyo-network/api-models'
import {
  describe, expect, it,
} from 'vitest'

import { LocationDivinerApi } from '../LocationDivinerApi.ts'
import type {
  LocationHeatmapQueryCreationRequest,
  LocationTimeRangeQueryCreationRequest,
} from '../Queries/index.ts'
import {
  LocationHeatmapQuerySchema,
  LocationTimeRangeQuerySchema,
} from '../Queries/index.ts'
import { LocationWitnessSchema } from '../Witnesses/index.ts'

const describeIf = <T>(expr?: T | null) => (expr ? describe : describe.skip)

const getLocationApiConfig = (): ApiConfig => {
  return { apiDomain: process.env.LOCATION_API_DOMAIN || 'http://localhost:8082' }
}

const getArchiveConfig = (): ApiConfig => {
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
    schema: LocationHeatmapQuerySchema,
    sourceArchive: 'temp',
    sourceArchivist,
  }
}

describeIf(process.env.LOCATION_API_DOMAIN)('LocationDivinerApi', () => {
  describe('constructor', () => {
    it('returns a new LocationDivinerApi', () => {
      const api = new LocationDivinerApi(getLocationApiConfig())
      expect(api).toBeDefined()
    })
  })
  describe('postLocationQuery', () => {
    it('posts a location heatmap query', async () => {
      const api = new LocationDivinerApi(getLocationApiConfig())
      const locationQuery = await api.postLocationQuery(getLocationHeatmapQueryCreationRequest())
      const response = await api.getLocationQuery(locationQuery.hash)
      expect(response.queryHash).toBe(locationQuery.hash)
    })
    it('posts a location time range query', async () => {
      const api = new LocationDivinerApi(getLocationApiConfig())
      const locationQuery = await api.postLocationQuery(getLocationTimeRangeQueryCreationRequest())
      const response = await api.getLocationQuery(locationQuery.hash)
      expect(response.queryHash).toBe(locationQuery.hash)
    })
  })
  describe('getLocationQuery', function () {
    it('gets the status of a previously posted location query', async () => {
      const api = new LocationDivinerApi(getLocationApiConfig())
      const locationQuery = await api.postLocationQuery(getLocationTimeRangeQueryCreationRequest())
      const response = await api.getLocationQuery(locationQuery.hash)
      expect(response.queryHash).toBe(locationQuery.hash)
    })
  })
})
