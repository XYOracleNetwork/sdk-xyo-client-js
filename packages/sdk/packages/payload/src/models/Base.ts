import { EmptyObject } from '@xyo-network/core'

export type WithTimestamp<T extends EmptyObject = EmptyObject> = T & { timestamp: number }

export type XyoPayloadSchema = 'network.xyo.payload'
export const XyoPayloadSchema: XyoPayloadSchema = 'network.xyo.payload'

//we put {schema: string} first since we want it be be changed to the type of T's schema
export type XyoPayload<T extends EmptyObject = EmptyObject, TSchema extends string = string> = T & {
  schema: TSchema
  previousHash?: string
  sources?: string[]
  timestamp?: number
}
