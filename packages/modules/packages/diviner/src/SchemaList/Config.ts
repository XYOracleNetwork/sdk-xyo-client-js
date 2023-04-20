import { Payload } from '@xyo-network/payload-model'

import { PayloadStatsDivinerConfig } from '../PayloadStats'
import { SchemaListDivinerSchema } from './Schema'

export type SchemaListDivinerConfigSchema = `${SchemaListDivinerSchema}.config`
export const SchemaListDivinerConfigSchema: SchemaListDivinerConfigSchema = `${SchemaListDivinerSchema}.config`

export type SchemaListDivinerConfig<S extends string = SchemaListDivinerConfigSchema, T extends Payload = Payload> = PayloadStatsDivinerConfig<
  S,
  T & {
    schema: S
  }
>
