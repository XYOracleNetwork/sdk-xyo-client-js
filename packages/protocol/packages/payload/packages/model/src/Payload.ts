import { Hash } from '@xylabs/hex'
import { EmptyObject, JsonObject } from '@xylabs/object'

import { Schema, WithSchema } from './Schema'

/** Meta fields for a payload - Either both $hash and $meta should exist or neither */
export interface PayloadMetaFields extends EmptyObject {
  /** Hash of the body of the payload excluding the items in the $meta object */
  $hash: Hash
  /** Meta data that should be included in the main hash of the payload */
  $meta?: JsonObject
}

/** Additional fields for a payload */
export type PayloadFields = EmptyObject

export type WithPayload<T extends EmptyObject | void = void> = WithSchema<T extends EmptyObject ? PayloadFields & T : PayloadFields>

/** Base Type for Payloads */
export type Payload<T extends void | EmptyObject | WithSchema = void, S extends Schema | void = void> = T extends WithSchema
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

export type WithMeta<T extends Payload = Payload> = T & PayloadMetaFields
export type WithOptionalMeta<T extends Payload = Payload> = Partial<WithMeta<T>> & Omit<WithMeta<T>, '$hash'>

export type PayloadWithMeta<T extends void | EmptyObject | WithSchema = void, S extends Schema | void = void> = WithMeta<Payload<T, S>>

export const unMeta = <T extends WithMeta<Payload>>(payload?: T): T | undefined => {
  if (payload) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { $meta, $hash, ...result } = payload
    return result as T
  }
}
