import { Hash } from '@xylabs/hex'
import { JsonValue } from '@xylabs/object'

import { isPayloadOfSchemaType } from './isPayloadOfSchemaType.js'
import { Payload } from './Payload.js'

export type ModuleErrorSchema = 'network.xyo.error.module'
export const ModuleErrorSchema: ModuleErrorSchema = 'network.xyo.error.module'

export type ModuleError = Payload<{
  details?: JsonValue
  message?: string
  name?: string
  query?: Hash
  schema: ModuleErrorSchema
  sources?: Hash[]
}>

export const isModuleError = isPayloadOfSchemaType<ModuleError>(ModuleErrorSchema)
