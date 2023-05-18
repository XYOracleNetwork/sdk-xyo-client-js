import { DivinerConfig } from '@xyo-network/diviner-model'
import { ModuleFilter } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { SchemaStatsDivinerSchema } from './Schema'

export type SchemaStatsDivinerConfigSchema = `${SchemaStatsDivinerSchema}.config`
export const SchemaStatsDivinerConfigSchema: SchemaStatsDivinerConfigSchema = `${SchemaStatsDivinerSchema}.config`

export type SchemaStatsDivinerConfig<T extends Payload = Payload> = DivinerConfig<
  T & {
    archivist?: ModuleFilter
    schema: SchemaStatsDivinerConfigSchema
  }
>
