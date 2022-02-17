export interface ArchiveResponse {
  archive: string
  user: string
  accessControl: boolean
}

export interface PutArchiveRequest {
  accessControl: boolean
}

export type ArchiveKeyResponse = {
  created: string
  key: string
}
