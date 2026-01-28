import {
  asSchema, type Payload, type Query,
} from '@xyo-network/payload-model'

import { SchemaListDivinerSchema } from './Schema.ts'

export const SchemaListQuerySchema = asSchema(`${SchemaListDivinerSchema}.query`, true)
export type SchemaListQuerySchema = typeof SchemaListQuerySchema

export type SchemaListQueryPayload = Query<{ schema: SchemaListQuerySchema }>
export const isSchemaListQueryPayload = (x?: Payload | null): x is SchemaListQueryPayload => x?.schema === SchemaListQuerySchema
