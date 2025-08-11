import type { Hash } from '@xylabs/hex'
import type {
  DeepOmitStartsWith, DeepPickStartsWith, EmptyObject,
} from '@xylabs/object'

import type { Schema, WithSchema } from './Schema.ts'

export interface SchemaField<T extends Schema = Schema> {
  schema: T
}

/** Additional fields for a payload */
export interface PayloadFields extends SchemaField {}

export interface SourcesMetaField { $sources: Hash[] }

export interface PayloadMetaFields extends SourcesMetaField {}

export type WithPayload<T extends EmptyObject | void = void>
  = WithSchema<T extends EmptyObject ? PayloadFields & T : PayloadFields>

/** Base Type for Payloads */
export type Payload<T extends void | EmptyObject | WithSchema = void, S extends Schema | void = void>
  = (T extends WithSchema
    ? S extends Schema
      /* T (w/Schema) & S provided */
      ? WithPayload<Omit<T, 'schema'> & { schema: S }>
      : /* Only T (w/Schema) provided */ WithPayload<T>
    : T extends object
      ? S extends Schema
      /* T (w/o Schema) & S provided */
        ? WithPayload<T & { schema: S }>
        : /* Only T (w/o Schema) provided */ WithPayload<T & PayloadFields>
      : /* Either just S or neither S or T provided */ WithPayload<{
        schema: S extends Schema ? S : Schema
      }>) & Partial<PayloadMetaFields>

export type OverridablePayload<T extends Payload> = WithoutMeta<Omit<T, 'schema'> & PayloadFields>

export type WithSources<T extends EmptyObject> = T & SourcesMetaField
/** @deprecated optional $sources are now optional in all Payloads */
export type WithOptionalSources<T extends EmptyObject> = (T & SourcesMetaField) | T

export type PayloadWithSources<T extends void | EmptyObject | WithSchema = void, S extends Schema | void = void> = WithSources<Payload<T, S>>

/** @deprecated optional $sources are now optional in all Payloads */
// eslint-disable-next-line sonarjs/deprecation
export type PayloadWithOptionalSources<T extends void | EmptyObject | WithSchema = void, S extends Schema | void = void> = WithOptionalSources<Payload<T, S>>

export type WithAnySchema<T extends Payload> = OverridablePayload<T>

export type WithoutClientMeta<T extends Payload | EmptyObject> = DeepOmitStartsWith<T, '$'> & (T extends Payload ? Payload : EmptyObject)
export type WithoutStorageMeta<T extends Payload | EmptyObject> = DeepOmitStartsWith<T, '_'> & (T extends Payload ? Payload : EmptyObject)
export type WithoutPrivateStorageMeta<T extends Payload | EmptyObject> = DeepOmitStartsWith<T, '__'> & (T extends Payload ? Payload : EmptyObject)
export type WithoutMeta<T extends Payload | EmptyObject> = WithoutClientMeta<WithoutStorageMeta<T>> & (T extends Payload ? Payload : EmptyObject)

export type WithoutSchema<T extends WithOptionalSchema<Payload>> = Omit<T, 'schema'>
export type WithOptionalSchema<T extends Payload = Payload> = WithoutSchema<T> & Partial<T & SchemaField>

export type WithOnlyClientMeta<T extends Payload> = DeepPickStartsWith<T, '$'>
