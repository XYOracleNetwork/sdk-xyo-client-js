import { XyoModuleDiscoverQuery, XyoModuleDiscoverQuerySchema } from './Discover'
import { XyoModuleInitializeQuery, XyoModuleInitializeQuerySchema } from './Initialize'
import { XyoModuleShutdownQuery, XyoModuleShutdownQuerySchema } from './Shutdown'
import { XyoModuleSubscribeQuery, XyoModuleSubscribeQuerySchema } from './Subscribe'

export * from './Discover'
export * from './Initialize'
export * from './Shutdown'
export * from './Subscribe'

export type XyoModuleQuerySchema =
  | XyoModuleSubscribeQuerySchema
  | XyoModuleDiscoverQuerySchema
  | XyoModuleInitializeQuerySchema
  | XyoModuleShutdownQuerySchema

export type XyoModuleQuery = XyoModuleSubscribeQuery | XyoModuleDiscoverQuery | XyoModuleInitializeQuery | XyoModuleShutdownQuery
