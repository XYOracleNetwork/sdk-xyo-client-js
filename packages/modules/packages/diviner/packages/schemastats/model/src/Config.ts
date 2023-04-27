import { DivinerConfig } from '@xyo-network/diviner-model'
import { Payload } from '@xyo-network/payload-model'

import { SchemaStatsDivinerSchema } from './Schema'

export type SchemaStatsDivinerConfigSchema = `${SchemaStatsDivinerSchema}.config`
export const SchemaStatsDivinerConfigSchema: SchemaStatsDivinerConfigSchema = `${SchemaStatsDivinerSchema}.config`

export type SchemaStatsDivinerConfig<S extends string = string, T extends Payload = Payload> = DivinerConfig<
  T & {
    schema: S
  }
>
