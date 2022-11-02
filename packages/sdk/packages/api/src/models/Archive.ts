import { XyoArchivePath } from './ArchivePath'

export type AccessLevel = 'public' | 'private' | 'none'
export type AccessType = 'read' | 'remove' | 'create' | 'list'
export type ExpirationWindow = 'create' | 'read'

export interface XyoAccessControl {
  access?: Record<AccessType, AccessLevel>
  expiration?: {
    delay?: number
    window?: ExpirationWindow
  }
}

export interface XyoAccessControls {
  /**
   * Set access controls on a per schema basis.
   * '*' can be used as a wildcard
   * Access control is set from a generic to specific direction if
   * multiple wildcard versions apply to a schema
   */
  schema?: Record<string, XyoAccessControl>
}

export interface XyoArchive extends XyoArchivePath {
  accessControl?: XyoAccessControl | boolean
  user?: string
}
