import { ApiConfig } from '@xylabs/sdk-js'

export interface ArchiveConfig extends ApiConfig {
  archive: string
}
export interface LocationDivinerQuery {
  startTime?: string
  stopTime?: string
  // TODO: Bounding rectangle, etc.
}
export interface LocationDivinerQueryRequest {
  sourceArchive: ArchiveConfig
  resultArchive: ArchiveConfig
  query: LocationDivinerQuery
}
export interface LocationDivinerQueryResult extends LocationDivinerQueryRequest {
  status: 'pending' | 'error' | 'completed'
  hash: string
}
