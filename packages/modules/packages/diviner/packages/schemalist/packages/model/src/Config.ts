import type { DivinerConfig } from '@xyo-network/diviner-model'
import { asSchema, type Payload } from '@xyo-network/payload-model'

import { SchemaListDivinerSchema } from './Schema.ts'

export const SchemaListDivinerConfigSchema = asSchema(`${SchemaListDivinerSchema}.config`, true)
export type SchemaListDivinerConfigSchema = typeof SchemaListDivinerConfigSchema

export type SchemaListDivinerConfig<T extends Payload = Payload> = DivinerConfig<
  T & {
    schema: SchemaListDivinerConfigSchema
  }
>
