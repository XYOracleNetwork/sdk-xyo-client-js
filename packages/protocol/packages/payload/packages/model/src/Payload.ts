import { Hash } from '@xyo-network/hash-model'

import { EmptyPayload } from './EmptyPayload'

export type Schema = string

export type WithTimestamp<T extends EmptyPayload = EmptyPayload> = T & { timestamp: number }

export type PayloadSchema = 'network.xyo.payload'
export const PayloadSchema: PayloadSchema = 'network.xyo.payload'

export type SchemaFields = {
  schema: Schema
}

export type WithSchema<T extends EmptyPayload | void = void> = T extends EmptyPayload ? SchemaFields & T : SchemaFields & EmptyPayload

export type PayloadFields = {
  sources?: Hash[]
}

export type WithPayload<T extends object | void = void> = WithSchema<T extends object ? PayloadFields & T : PayloadFields>

export type Payload<T extends void | object | WithSchema = void, S extends Schema | void = void> = T extends WithSchema
  ? S extends Schema
    ? /* T (w/Schema) & S provided */
      WithPayload<Omit<T, 'schema'> & { schema: S }>
    : /* Only T (w/Schema) provided */
      WithPayload<T>
  : T extends object
  ? S extends Schema
    ? /* T (w/o Schema) & S provided */
      WithPayload<T & { schema: S }>
    : /* Only T (w/o Schema) provided */
      WithPayload<T & { schema: string }>
  : /* Either just S or neither S or T provided */
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [index: string]: any
      schema: S extends Schema ? S : string
    }
