import { Hash } from '@xylabs/hex'
import {
  DeepOmitStartsWith, DeepPickStartsWith, DeepRestrictToStringKeys, EmptyObject,
  JsonObject,
} from '@xylabs/object'

import { Schema, WithSchema } from './Schema.ts'

export interface SchemaField<T extends Schema = Schema> {
  schema: T
}

/** Additional fields for a payload */
export interface PayloadFields extends SchemaField {}

// elevate - include the data hash in the parent boundwitness [data hash so that the opcodes get ignored]
export type OpCode = 'elevate'

export interface SourcesMetaField { $sources: Hash[] }
export interface ChainMetaFields {
  $opCodes?: OpCode[]
}

export interface PayloadMetaFields extends SourcesMetaField, ChainMetaFields {}

export type WithPayload<T extends EmptyObject | void = void> =
  DeepRestrictToStringKeys<WithSchema<T extends EmptyObject ? PayloadFields & T : PayloadFields>>

/** Base Type for Payloads */
export type Payload<T extends void | EmptyObject | WithSchema = void, S extends Schema | void = void> =
  (T extends WithSchema ?
    S extends Schema ?
      /* T (w/Schema) & S provided */
      WithPayload<Omit<T, 'schema'> & { schema: S }>
      : /* Only T (w/Schema) provided */ WithPayload<T>
    : T extends object ?
      S extends Schema ?
      /* T (w/o Schema) & S provided */
        WithPayload<T & { schema: S }>
        : /* Only T (w/o Schema) provided */ WithPayload<T & PayloadFields>
      : /* Either just S or neither S or T provided */
      WithPayload<{
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

export type WithoutClientMeta<T extends EmptyObject> = DeepOmitStartsWith<T, '$'>
export type WithoutStorageMeta<T extends EmptyObject> = DeepOmitStartsWith<T, '_'>
export type WithoutPrivateStorageMeta<T extends EmptyObject> = DeepOmitStartsWith<T, '__'>
export type WithoutMeta<T extends EmptyObject> = WithoutClientMeta<WithoutStorageMeta<T>>

export type WithoutSchema<T extends WithOptionalSchema<Payload>> = Omit<T, 'schema'>
export type WithOptionalSchema<T extends EmptyObject = EmptyObject> = WithoutSchema<T> & Partial<T & SchemaField>

export type WithOnlyClientMeta<T extends EmptyObject> = DeepPickStartsWith<T, '$'>

export type AnyPayload = Payload<JsonObject, Schema>
