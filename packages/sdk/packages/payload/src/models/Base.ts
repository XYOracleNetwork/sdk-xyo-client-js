import { EmptyObject } from '@xyo-network/core'

export type WithTimestamp<T extends EmptyObject = EmptyObject> = T & { timestamp: number }

export type XyoPayloadSchema = 'network.xyo.payload'
export const XyoPayloadSchema: XyoPayloadSchema = 'network.xyo.payload'

type XyoPayloadBaseWithSchema<T extends EmptyObject = EmptyObject> = {
  schema: string
} & T

type XyoPayloadBase<T extends EmptyObject = EmptyObject> = XyoPayloadBaseWithSchema<
  {
    previousHash?: string
    sources?: string[]
    timestamp?: number
  } & T
>

export type XyoPayload<T extends void | EmptyObject | XyoPayloadBaseWithSchema = void, S extends string = string> = T extends XyoPayloadBaseWithSchema
  ? XyoPayloadBase<T>
  : T extends EmptyObject
  ? XyoPayloadBase & T & { schema: S }
  : XyoPayloadBase & { schema: S }
