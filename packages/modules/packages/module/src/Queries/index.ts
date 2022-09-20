import { XyoQuery } from '../Query'
import { XyoModuleDiscoverQuery } from './Discover'
import { XyoModuleInitializeQuery } from './Initialize'
import { XyoModuleShutdownQuery } from './Shutdown'
import { XyoModuleSubscribeQuery } from './Subscribe'

export * from './Discover'
export * from './Initialize'
export * from './Shutdown'
export * from './Subscribe'

export type XyoModuleQueryBase = XyoModuleSubscribeQuery | XyoModuleDiscoverQuery | XyoModuleInitializeQuery | XyoModuleShutdownQuery

export type XyoModuleQuery<T extends XyoQuery | void = void> = T extends XyoQuery ? XyoModuleQueryBase | T : XyoModuleQueryBase

export type XyoModuleQuerySchema = XyoModuleQuery['schema']
