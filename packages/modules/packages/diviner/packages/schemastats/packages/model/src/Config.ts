import type { DivinerConfig } from '@xyo-network/diviner-model'
import { asSchema, type Payload } from '@xyo-network/payload-model'

import { SchemaStatsDivinerSchema } from './Schema.ts'

export const SchemaStatsDivinerConfigSchema = asSchema(`${SchemaStatsDivinerSchema}.config`, true)
export type SchemaStatsDivinerConfigSchema = typeof SchemaStatsDivinerConfigSchema

export type SchemaStatsDivinerConfig<T extends Payload = Payload> = DivinerConfig<
  T & {
    schema: SchemaStatsDivinerConfigSchema
  }
>
