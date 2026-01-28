import type { Hash, JsonValue } from '@xylabs/sdk-js'

import { isPayloadOfSchemaType } from './isPayloadOfSchemaType.ts'
import type { Payload } from './Payload.ts'
import { asSchema, type Schema } from './Schema.ts'

export const ModuleErrorSchema = asSchema('network.xyo.error.module', true)
export type ModuleErrorSchema = typeof ModuleErrorSchema

export type ModuleError = Payload<{
  details?: JsonValue
  message?: string
  name?: string
  query?: Hash | Schema
}, ModuleErrorSchema>

export const isModuleError = isPayloadOfSchemaType<ModuleError>(ModuleErrorSchema)
