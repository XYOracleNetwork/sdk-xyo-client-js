import { DivinerConfig } from '@xyo-network/diviner-model'
import { JsonValue } from '@xyo-network/object'

import { JsonPatchDivinerSchema } from './Schema'

export type JsonPatchDivinerConfigSchema = `${JsonPatchDivinerSchema}.config`
export const JsonPatchDivinerConfigSchema: JsonPatchDivinerConfigSchema = `${JsonPatchDivinerSchema}.config`

export interface Operation {
  op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test'
  path: string
  value?: JsonValue
}

export type JsonPatchDivinerConfig = DivinerConfig<{ operations?: Operation[] } & { schema: JsonPatchDivinerConfigSchema }>
