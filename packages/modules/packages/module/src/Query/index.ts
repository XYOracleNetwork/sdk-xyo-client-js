import { XyoModuleDiscoverQueryPayload, XyoModuleDiscoverQueryPayloadSchema } from './Discover'
import { XyoModuleInitializeQueryPayload, XyoModuleInitializeQueryPayloadSchema } from './Initialize'
import { XyoModuleShutdownQueryPayload, XyoModuleShutdownQueryPayloadSchema } from './Shutdown'
import { XyoModuleSubscribeQueryPayload, XyoModuleSubscribeQueryPayloadSchema } from './Subscribe'

export * from './Discover'
export * from './Initialize'
export * from './Query'
export * from './Shutdown'
export * from './Subscribe'

export type XyoModuleQueryPayloadSchema =
  | XyoModuleSubscribeQueryPayloadSchema
  | XyoModuleDiscoverQueryPayloadSchema
  | XyoModuleInitializeQueryPayloadSchema
  | XyoModuleShutdownQueryPayloadSchema

export type XyoModuleQueryPayload =
  | XyoModuleSubscribeQueryPayload
  | XyoModuleDiscoverQueryPayload
  | XyoModuleInitializeQueryPayload
  | XyoModuleShutdownQueryPayload
