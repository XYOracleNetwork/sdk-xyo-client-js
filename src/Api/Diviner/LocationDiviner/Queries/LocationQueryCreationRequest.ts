import { XyoApiConfig } from '../../../models'
import { LocationHeatmapQuery, LocationHeatmapQuerySchema } from './LocationHeatmapQuery'
import { LocationQuadkeyHeatmapQuery, LocationQuadkeyHeatmapQuerySchema } from './LocationQuadkeyHeatmapQuery'
import { LocationQuerySchema } from './LocationQuerySchema'
import { LocationTimeRangeQuery, LocationTimeRangeQuerySchema } from './LocationTimeRangeQuery'

export interface LocationQueryCreationRequest<TSchema extends LocationQuerySchema = LocationQuerySchema, TQuery extends Record<string, unknown> = Record<string, unknown>> {
  sourceArchivist: XyoApiConfig
  sourceArchive: string
  resultArchivist: XyoApiConfig
  resultArchive: string
  schema: TSchema
  query: TQuery
}

export type LocationTimeRangeQueryCreationRequest = LocationQueryCreationRequest<LocationTimeRangeQuerySchema, LocationTimeRangeQuery>
export type LocationHeatmapQueryCreationRequest = LocationQueryCreationRequest<LocationHeatmapQuerySchema, LocationHeatmapQuery>

export type LocationQuadkeyHeatmapQueryCreationRequest = LocationQueryCreationRequest<LocationQuadkeyHeatmapQuerySchema, LocationQuadkeyHeatmapQuery>

export type SupportedLocationQueryCreationRequest = LocationTimeRangeQueryCreationRequest | LocationHeatmapQueryCreationRequest | LocationQuadkeyHeatmapQueryCreationRequest
