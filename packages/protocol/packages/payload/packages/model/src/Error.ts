import type { Hash } from '@xylabs/hex'
import type { JsonValue } from '@xylabs/object'

import { isPayloadOfSchemaType } from './isPayloadOfSchemaType.ts'
import type { Payload } from './Payload.ts'

export const ModuleErrorSchema = 'network.xyo.error.module' as const
export type ModuleErrorSchema = typeof ModuleErrorSchema

export type ModuleError = Payload<{
  details?: JsonValue
  message?: string
  name?: string
  query?: Hash
  schema: ModuleErrorSchema
}>

export const isModuleError = isPayloadOfSchemaType<ModuleError>(ModuleErrorSchema)
