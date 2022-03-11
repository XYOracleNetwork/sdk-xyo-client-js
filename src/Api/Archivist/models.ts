export interface ArchiveResponse {
  user: string
  accessControl: boolean
  archive: string
}

export interface PutArchiveRequest {
  accessControl: boolean
}

export interface ArchiveKeyResponse {
  created: string
  key: string
}
