import type { DivinerConfig } from '@xyo-network/diviner-model'
// eslint-disable-next-line import-x/no-internal-modules
import type { Operation } from 'json-joy-16-19-0/lib/json-patch'

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
