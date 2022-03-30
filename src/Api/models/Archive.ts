import { XyoArchivePath } from './ArchivePath'

export type AccessLevel = 'public' | 'private'
export type ExpirationWindow = 'create' | 'read'

export interface SchemaConfig {
  read?: AccessLevel
  write?: AccessLevel
  list?: AccessLevel
  expiration?: {
    window?: ExpirationWindow
    delay?: number
  }
}

export interface XyoArchive extends XyoArchivePath {
  user?: string
  accessControl?: boolean
  schemaConfig?: Record<string, SchemaConfig>
}
