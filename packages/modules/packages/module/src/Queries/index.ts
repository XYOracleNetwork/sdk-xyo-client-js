import { XyoQuery } from '../Query'
import { XyoModuleDiscoverQuery } from './Discover'
import { XyoModuleSubscribeQuery } from './Subscribe'

export * from './Discover'
export * from './Subscribe'

export type XyoModuleQueryBase = XyoModuleSubscribeQuery | XyoModuleDiscoverQuery

export type XyoModuleQuery<T extends XyoQuery | void = void> = T extends XyoQuery ? XyoModuleQueryBase | T : XyoModuleQueryBase
