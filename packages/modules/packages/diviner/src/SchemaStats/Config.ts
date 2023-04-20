import { Payload } from '@xyo-network/payload-model'

import { PayloadStatsDivinerConfig } from '../PayloadStats'
import { SchemaStatsDivinerSchema } from './Schema'

export type SchemaStatsDivinerConfigSchema = `${SchemaStatsDivinerSchema}.config`
export const SchemaStatsDivinerConfigSchema: SchemaStatsDivinerConfigSchema = `${SchemaStatsDivinerSchema}.config`

export type SchemaStatsDivinerConfig<S extends string = SchemaStatsDivinerConfigSchema, T extends Payload = Payload> = PayloadStatsDivinerConfig<
  S,
  T & {
    schema: S
  }
>
