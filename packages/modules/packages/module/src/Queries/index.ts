import { XyoQuery } from '../Query'
import { XyoModuleDiscoverQuery, XyoModuleDiscoverQuerySchema } from './Discover'
import { XyoModuleInitializeQuery, XyoModuleInitializeQuerySchema } from './Initialize'
import { XyoModuleShutdownQuery, XyoModuleShutdownQuerySchema } from './Shutdown'
import { XyoModuleSubscribeQuery, XyoModuleSubscribeQuerySchema } from './Subscribe'

export * from './Discover'
export * from './Initialize'
export * from './Shutdown'
export * from './Subscribe'

type XyoModuleQuerySchemaBase =
  | XyoModuleSubscribeQuerySchema
  | XyoModuleDiscoverQuerySchema
  | XyoModuleInitializeQuerySchema
  | XyoModuleShutdownQuerySchema

export type XyoModuleQuerySchema<T extends string | void = void> = T extends string ? XyoModuleQuerySchemaBase | T : XyoModuleQuerySchemaBase

type XyoModuleQueryBase = XyoModuleSubscribeQuery | XyoModuleDiscoverQuery | XyoModuleInitializeQuery | XyoModuleShutdownQuery

export type XyoModuleQuery<T extends XyoQuery | void = void> = T extends XyoQuery ? XyoModuleQueryBase | T : XyoModuleQueryBase
