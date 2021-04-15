interface XyoHashJson {
  hash: string
}

type WithXyoHash<T> = T & XyoHashJson

export type { WithXyoHash, XyoHashJson }
