import { DivinerConfig } from '@xyo-network/diviner-model'
import type { Operation } from 'json-joy/lib/json-patch/index.ts'

import { JsonPatchDivinerSchema } from './Schema.ts'

export type JsonPatchDivinerConfigSchema = `${JsonPatchDivinerSchema}.config`
export const JsonPatchDivinerConfigSchema: JsonPatchDivinerConfigSchema = `${JsonPatchDivinerSchema}.config`

// TODO: Export our own compatible Operation type to hide implementation details
// export interface Operation {
//   op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test'
//   path: string
//   value?: JsonValue
// }

export type JsonPatchDivinerConfig = DivinerConfig<{ operations?: Operation[] } & { schema: JsonPatchDivinerConfigSchema }>
