import { DivinerConfig } from '@xyo-network/diviner-model'
// eslint-disable-next-line import/no-internal-modules
import { Operation } from 'json-joy/lib/json-patch'

import { JsonPatchDivinerSchema } from './Schema'

export type JsonPatchDivinerConfigSchema = `${JsonPatchDivinerSchema}.config`
export const JsonPatchDivinerConfigSchema: JsonPatchDivinerConfigSchema = `${JsonPatchDivinerSchema}.config`

// TODO: Export our own compatible Operation type to hide implementation details
// export interface Operation {
//   op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test'
//   path: string
//   value?: JsonValue
// }

export type JsonPatchDivinerConfig = DivinerConfig<{ operations?: Operation[] } & { schema: JsonPatchDivinerConfigSchema }>
