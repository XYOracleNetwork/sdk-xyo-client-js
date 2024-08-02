import { DivinerConfig } from '@xyo-network/diviner-model'
import { Payload } from '@xyo-network/payload-model'

import { SchemaListDivinerSchema } from './Schema.ts'

export type SchemaListDivinerConfigSchema = `${SchemaListDivinerSchema}.config`
export const SchemaListDivinerConfigSchema: SchemaListDivinerConfigSchema = `${SchemaListDivinerSchema}.config`

export type SchemaListDivinerConfig<T extends Payload = Payload> = DivinerConfig<
  T & {
    schema: SchemaListDivinerConfigSchema
  }
>
