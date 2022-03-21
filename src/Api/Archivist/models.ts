export interface ArchiveResponse {
  user: string
  accessControl: boolean
  archive: string
}

export interface PutArchiveRequest {
  accessControl: boolean
}

export interface ArchiveKey {
  created: string
  key: string
}

export interface XyoApiEnvelope<T> {
  data?: T
}
