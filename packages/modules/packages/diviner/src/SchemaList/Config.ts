import { Payload } from '@xyo-network/payload-model'

import { PayloadStatsDivinerConfig } from '../PayloadStats'
import { SchemaListDivinerSchema } from './Schema'

export type SchemaListConfigSchema = `${SchemaListDivinerSchema}.config`
export const SchemaListConfigSchema: SchemaListConfigSchema = `${SchemaListDivinerSchema}.config`

export type SchemaListDivinerConfig<S extends string = SchemaListConfigSchema, T extends Payload = Payload> = PayloadStatsDivinerConfig<
  S,
  T & {
    schema: S
  }
>
