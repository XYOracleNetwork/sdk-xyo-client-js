/** @deprecated use offset as a string (hash) instead */
export interface XyoPayloadFindFilterTimeOffset {
  offset?: number
}

export interface XyoPayloadFindFilterHashOffset {
  offset?: string
}

// eslint-disable-next-line deprecation/deprecation
export type XyoPayloadFindFilterOffset = XyoPayloadFindFilterTimeOffset | XyoPayloadFindFilterHashOffset

export type XyoPayloadFindFilter = {
  order?: 'desc' | 'asc'
  /** @deprecated use offset instead */
  timestamp?: number
  limit?: number
  schema?: string
} & XyoPayloadFindFilterOffset
