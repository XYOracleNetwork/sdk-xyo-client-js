import type { DivinerConfig } from '@xyo-network/diviner-model'
import type { Payload } from '@xyo-network/payload-model'

import { SchemaStatsDivinerSchema } from './Schema.ts'

export type SchemaStatsDivinerConfigSchema = `${SchemaStatsDivinerSchema}.config`
export const SchemaStatsDivinerConfigSchema: SchemaStatsDivinerConfigSchema = `${SchemaStatsDivinerSchema}.config`

export type SchemaStatsDivinerConfig<T extends Payload = Payload> = DivinerConfig<
  T & {
    schema: SchemaStatsDivinerConfigSchema
  }
>
