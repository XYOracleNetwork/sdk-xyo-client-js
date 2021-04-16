interface XyoPayloadMeta {
  _schema: string
  _timestamp: number
}

type WithXyoPayloadMeta<T> = T & XyoPayloadMeta

export type { WithXyoPayloadMeta, XyoPayloadMeta }
