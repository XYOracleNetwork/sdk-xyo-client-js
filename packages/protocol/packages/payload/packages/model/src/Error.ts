import { Hash } from '@xylabs/hex'

import { isPayloadOfSchemaType } from './isPayloadOfSchemaType'
import { Payload } from './Payload'

export type ModuleErrorSchema = 'network.xyo.error.module'
export const ModuleErrorSchema: ModuleErrorSchema = 'network.xyo.error.module'

export type ModuleError = Payload<{
  message?: string
  name?: string
  query?: Hash
  schema: ModuleErrorSchema
  sources?: Hash[]
}>

export const isModuleError = isPayloadOfSchemaType<ModuleError>(ModuleErrorSchema)
