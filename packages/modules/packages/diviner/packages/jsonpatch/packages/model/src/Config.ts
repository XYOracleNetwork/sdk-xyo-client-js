import type { DivinerConfig } from '@xyo-network/diviner-model'
import { asSchema } from '@xyo-network/payload-model'
import type { Operation } from 'fast-json-patch'

import { JsonPatchDivinerSchema } from './Schema.ts'

export const JsonPatchDivinerConfigSchema = asSchema(`${JsonPatchDivinerSchema}.config`, true)
export type JsonPatchDivinerConfigSchema = typeof JsonPatchDivinerConfigSchema

// TODO: Export our own compatible Operation type to hide implementation details
// export interface Operation {
//   op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test'
//   path: string
//   value?: JsonValue
// }

export type JsonPatchDivinerConfig = DivinerConfig<{ operations?: Operation[] } & { schema: JsonPatchDivinerConfigSchema }>
