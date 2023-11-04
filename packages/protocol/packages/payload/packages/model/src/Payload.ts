import { EmptyPayload } from './EmptyPayload'

export type Schema = string

export type WithTimestamp<T extends EmptyPayload = EmptyPayload> = T & { timestamp: number }

export type PayloadSchema = 'network.xyo.payload'
export const PayloadSchema: PayloadSchema = 'network.xyo.payload'

export type SchemaFields = {
  schema: Schema
}

export type WithSchema<T extends EmptyPayload | void = void> = T extends EmptyPayload ? SchemaFields & T : SchemaFields

// eslint-disable-next-line @typescript-eslint/ban-types
export type PayloadFields = {}

export type WithPayload<T extends EmptyPayload | void = void> = WithSchema<T extends EmptyPayload ? PayloadFields & T : PayloadFields>

export type Payload<T extends void | object | WithSchema = void, S extends Schema | void = void> = T extends WithSchema
  ? S extends Schema
    ? /* T (w/Schema) & S provided */
      WithPayload<Omit<T, 'schema'> & { schema: S } & PayloadFields>
    : /* Only T (w/Schema) provided */
      WithPayload<T>
  : T extends object
  ? S extends Schema
    ? /* T (w/o Schema) & S provided */
      WithPayload<T & { schema: S } & PayloadFields>
    : /* Only T (w/o Schema) provided */
      WithPayload<T & { schema: Schema } & PayloadFields>
  : /* Either just S or neither S or T provided */
    {
      schema: S extends Schema ? S : Schema
    } & PayloadFields

export type OverridablePayload<T extends Payload> = Omit<T, 'schema'> & { schema: string }
