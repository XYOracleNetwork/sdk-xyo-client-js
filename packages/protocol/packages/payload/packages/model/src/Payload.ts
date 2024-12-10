import type { Hash } from '@xylabs/hex'
import type { EmptyObject } from '@xylabs/object'

import type { Schema, WithSchema } from './Schema.ts'

/** Additional fields for a payload */
export interface PayloadFields extends EmptyObject {
  schema: Schema
}

export type WithPayload<T extends EmptyObject | void = void> = WithSchema<T extends EmptyObject ? PayloadFields & T : PayloadFields>

/** Base Type for Payloads */
export type Payload<T extends void | EmptyObject | WithSchema = void, S extends Schema | void = void> =
  T extends WithSchema ?
    S extends Schema ?
      /* T (w/Schema) & S provided */
      WithPayload<Omit<T, 'schema'> & { schema: S } & PayloadFields>
      : /* Only T (w/Schema) provided */ WithPayload<T>
    : T extends object ?
      S extends Schema ?
      /* T (w/o Schema) & S provided */
        WithPayload<T & { schema: S } & PayloadFields>
        : /* Only T (w/o Schema) provided */ WithPayload<T & { schema: Schema } & PayloadFields>
      : /* Either just S or neither S or T provided */
        {
          schema: S extends Schema ? S : Schema
        } & PayloadFields

export type OverridablePayload<T extends Payload> = Omit<T, 'schema'> & { schema: string }

export type WithSources<T extends EmptyObject> = T & { sources?: Hash[] }
export type PayloadWithSources<T extends void | EmptyObject | WithSchema = void, S extends Schema | void = void> = WithSources<Payload<T, S>>

export type WithAnySchema<T extends Payload> = Omit<T, 'schema'> & { schema: string }
