import type { Hash, JsonValue } from '@xylabs/sdk-js'

import { isPayloadOfSchemaType } from './isPayloadOfSchemaType.ts'
import type { Payload } from './Payload.ts'
import type { Schema } from './Schema.ts'

export const ModuleErrorSchema = 'network.xyo.error.module' as Schema
export type ModuleErrorSchema = typeof ModuleErrorSchema

export type ModuleError = Payload<{
  details?: JsonValue
  message?: string
  name?: string
  query?: Hash | Schema
  schema: ModuleErrorSchema
}>

export const isModuleError = isPayloadOfSchemaType<ModuleError>(ModuleErrorSchema)
