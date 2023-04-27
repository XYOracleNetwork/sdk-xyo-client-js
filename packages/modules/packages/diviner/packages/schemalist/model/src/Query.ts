import { Query } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { SchemaListDivinerSchema } from './Schema'

export type SchemaListQuerySchema = `${SchemaListDivinerSchema}.query`
export const SchemaListQuerySchema: SchemaListQuerySchema = `${SchemaListDivinerSchema}.query`

export type SchemaListQueryPayload = Query<{ schema: SchemaListQuerySchema }>
export const isSchemaListQueryPayload = (x?: Payload | null): x is SchemaListQueryPayload => x?.schema === SchemaListQuerySchema
