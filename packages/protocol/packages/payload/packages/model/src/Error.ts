import type { Hash } from '@xylabs/hex'
import type { JsonValue } from '@xylabs/object'

import { isPayloadOfSchemaType } from './isPayloadOfSchemaType.ts'
import type { Payload } from './Payload.ts'

export type ModuleErrorSchema = 'network.xyo.error.module'
export const ModuleErrorSchema: ModuleErrorSchema = 'network.xyo.error.module'

export type ModuleError = Payload<{
  details?: JsonValue
  message?: string
  name?: string
  query?: Hash
  schema: ModuleErrorSchema
}>

export const isModuleError = isPayloadOfSchemaType<ModuleError>(ModuleErrorSchema)
