import { Payload, Query } from '@xyo-network/payload-model'

import { JsonPatchSettings } from './Config'
import { JsonPatchDivinerSchema } from './Schema'

export type JsonPatchDivinerQuerySchema = `${JsonPatchDivinerSchema}.query`
export const JsonPatchDivinerQuerySchema: JsonPatchDivinerQuerySchema = `${JsonPatchDivinerSchema}.query`

export type JsonPatchDivinerQueryPayload = Query<{ schema: JsonPatchDivinerQuerySchema } & Partial<JsonPatchSettings>>
export const isJsonPatchDivinerQueryPayload = (x?: Payload | null): x is JsonPatchDivinerQueryPayload => x?.schema === JsonPatchDivinerQuerySchema
