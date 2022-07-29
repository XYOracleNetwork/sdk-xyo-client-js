import { EmptyObject } from '@xyo-network/core'

export type WithTimestamp<T> = T & { timestamp: number }

export type XyoPayload<T extends EmptyObject = EmptyObject> = {
  schema: string
  previousHash?: string
  sources?: string[]
  timestamp?: number
} & T

/** @deprecated use XyoPayload instead */
export type XyoPayloadBase<T extends EmptyObject = EmptyObject> = XyoPayload<T>
