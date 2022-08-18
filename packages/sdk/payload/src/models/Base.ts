import { EmptyObject } from '@xyo-network/core'

export type WithTimestamp<T extends EmptyObject = EmptyObject> = T & { timestamp: number }

export type XyoPayloadSchema = 'network.xyo.payload'
export const XyoPayloadSchema = 'network.xyo.payload'

//we put {schema: string} first since we want it be be changed to the type of T's schema
export type XyoPayload<T extends { schema: string } = { schema: string }> = { schema: string } & T & {
    previousHash?: string
    sources?: string[]
    timestamp?: number
  }

/** @deprecated use XyoPayload instead */
export type XyoPayloadBase<T extends { schema: string } = { schema: string }> = XyoPayload<T>
