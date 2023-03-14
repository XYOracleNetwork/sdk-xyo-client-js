/** @deprecated use offset as a string (hash) instead */
export interface PayloadFindFilterTimeOffset {
  offset?: number
}

export interface PayloadFindFilterHashOffset {
  offset?: string
}

// eslint-disable-next-line deprecation/deprecation
export type PayloadFindFilterOffset = PayloadFindFilterTimeOffset | PayloadFindFilterHashOffset

export type PayloadFindFilter = {
  //hash?: string | string[]
  limit?: number
  order?: 'desc' | 'asc'
  schema?: string | string[]
  /** @deprecated use offset instead */
  timestamp?: number
} & PayloadFindFilterOffset
