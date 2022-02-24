import { XyoArchivistApiConfig } from '../../ArchivistApi'

export interface LocationDivinerQuery {
  startTime?: string
  stopTime?: string
  schema: string
  // TODO: Bounding rectangle, etc.
}
export interface LocationDivinerQueryCreationRequest {
  sourceArchive: XyoArchivistApiConfig
  resultArchive: XyoArchivistApiConfig
  query: LocationDivinerQuery
}
export interface LocationDivinerQueryCreationResponse extends LocationDivinerQueryCreationRequest {
  status: 'pending' | 'error' | 'completed'
  hash: string
}
