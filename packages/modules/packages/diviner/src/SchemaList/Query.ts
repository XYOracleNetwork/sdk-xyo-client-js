import { Query } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { SchemaListDivinerSchema } from './Schema'

export type SchemaListDivinerQuerySchema = `${SchemaListDivinerSchema}.query`
export const SchemaListDivinerQuerySchema: SchemaListDivinerQuerySchema = `${SchemaListDivinerSchema}.query`

export type SchemaListQueryPayload = Query<{ schema: SchemaListDivinerQuerySchema }>
export const isSchemaListQueryPayload = (x?: Payload | null): x is SchemaListQueryPayload => x?.schema === SchemaListDivinerQuerySchema
