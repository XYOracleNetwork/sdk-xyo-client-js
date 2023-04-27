import { Payload } from '@xyo-network/payload-model'

import { SchemaListDivinerSchema } from './Schema'

export type SchemaListPayload = Payload<{
  schema: SchemaListDivinerSchema
  schemas: string[]
}>

export const isSchemaListPayload = (x?: Payload | null): x is SchemaListPayload => x?.schema === SchemaListDivinerSchema
