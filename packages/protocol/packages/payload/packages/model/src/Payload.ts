import { EmptyPayload } from './EmptyPayload'

export type Schema = string

export type WithTimestamp<T extends EmptyPayload = EmptyPayload> = T & { timestamp: number }

export type PayloadSchema = 'network.xyo.payload'
export const PayloadSchema: PayloadSchema = 'network.xyo.payload'

export type SchemaFields = {
  schema: Schema
}

export type WithSchema<T extends EmptyPayload | void = void> = T extends EmptyPayload ? SchemaFields & T : SchemaFields

export type PayloadFields = {
  sources?: string[]
}

export type WithPayload<T extends EmptyPayload | void = void> = WithSchema<T extends EmptyPayload ? PayloadFields & T : PayloadFields>

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
      WithPayload<T & { schema: Schema }>
  : /* Either just S or neither S or T provided */
    {
      schema: S extends Schema ? S : Schema
    }
