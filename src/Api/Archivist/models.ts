export interface XyoArchiveKey {
  created: string
  key: string
}

export interface XyoArchive {
  archive: string
  user?: string
  accessControl?: boolean
}
