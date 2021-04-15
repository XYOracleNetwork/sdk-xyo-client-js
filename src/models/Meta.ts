interface XyoMetaJson {
  _id?: string
  _ip?: string
  _timestamp?: number
}

type WithXyoMeta<T> = T & XyoMetaJson

export type { WithXyoMeta, XyoMetaJson }
