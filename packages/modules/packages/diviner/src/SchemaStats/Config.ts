import { Payload } from '@xyo-network/payload-model'

import { PayloadStatsDivinerConfig } from '../PayloadStats'
import { SchemaStatsDivinerSchema } from './Schema'

export type SchemaStatsConfigSchema = `${SchemaStatsDivinerSchema}.config`
export const SchemaStatsConfigSchema: SchemaStatsConfigSchema = `${SchemaStatsDivinerSchema}.config`

export type SchemaStatsDivinerConfig<S extends string = SchemaStatsConfigSchema, T extends Payload = Payload> = PayloadStatsDivinerConfig<
  S,
  T & {
    schema: S
  }
>
