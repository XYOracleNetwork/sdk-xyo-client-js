interface XyoPayloadMeta {
  [key: string]: unknown
  _hash?: string
  _client?: string
  _reportedHash?: string
  _timestamp?: number
  _observeDuration?: number
  _archive?: string
}

export type { XyoPayloadMeta }
