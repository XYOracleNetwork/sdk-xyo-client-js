//Meta fields are added only by the archivist.  This data is only used for optimization/security.
//They all start with an underscore since they are never included in the hash

interface XyoArchivistMetaJson {
  _archive?: string
  _ip?: string
  _timestamp?: number
}

type WithXyoArchivistMeta<T> = T & XyoArchivistMetaJson

export type { WithXyoArchivistMeta, XyoArchivistMetaJson }
