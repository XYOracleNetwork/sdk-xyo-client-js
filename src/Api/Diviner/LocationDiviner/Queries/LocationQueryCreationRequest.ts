import { XyoArchivistApiConfig } from '../../../Archivist'
import { LocationHeatmapQuery, LocationHeatmapQuerySchema } from './LocationHeatmapQuery'
import { LocationQuerySchema } from './LocationQuerySchema'
import { LocationTimeRangeQuery, LocationTimeRangeQuerySchema } from './LocationTimeRangeQuery'

export interface LocationQueryCreationRequest<
  TSchema extends LocationQuerySchema = LocationQuerySchema,
  TQuery extends Record<string, unknown> = Record<string, unknown>
> {
  sourceArchive: XyoArchivistApiConfig
  resultArchive: XyoArchivistApiConfig
  schema: TSchema
  query: TQuery
}

export type LocationTimeRangeQueryCreationRequest = LocationQueryCreationRequest<
  LocationTimeRangeQuerySchema,
  LocationTimeRangeQuery
>
export type LocationHeatmapQueryCreationRequest = LocationQueryCreationRequest<
  LocationHeatmapQuerySchema,
  LocationHeatmapQuery
>

export type SupportedLocationQueryCreationRequest =
  | LocationTimeRangeQueryCreationRequest
  | LocationHeatmapQueryCreationRequest
