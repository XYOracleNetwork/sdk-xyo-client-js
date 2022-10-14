import { EmptyObject } from '@xyo-network/core'

export type WithTimestamp<T extends EmptyObject = EmptyObject> = T & { timestamp: number }

export type XyoPayloadSchema = 'network.xyo.payload'
export const XyoPayloadSchema: XyoPayloadSchema = 'network.xyo.payload'

export type SchemaFields = {
  schema: string
}

export type WithSchema<T extends EmptyObject | void = void> = T extends EmptyObject ? SchemaFields & T : SchemaFields

export type PayloadFields = {
  sources?: string[]
  timestamp?: number
}

export type WithPayload<T extends EmptyObject | void = void> = WithSchema<T extends EmptyObject ? PayloadFields & T : PayloadFields>

export type XyoPayload<
  T extends void | EmptyObject | WithSchema = void,
  S extends string = T extends WithSchema ? T['schema'] : string,
> = T extends WithSchema
  ? /* Type sent is an XyoPayload */
    WithPayload<T>
  : T extends EmptyObject
  ? /* Type sent is an Object */
    WithPayload<T & { schema: S }>
  : /* Type sent is void */
    WithPayload<{ schema: S }>
