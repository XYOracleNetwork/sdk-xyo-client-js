import { XyoQuery } from '../Query'
import { ModuleDiscoverQuery } from './Discover'
import { ModuleSubscribeQuery } from './Subscribe'

export * from './Discover'
export * from './Subscribe'

export type ModuleQueryBase = ModuleSubscribeQuery | ModuleDiscoverQuery

export type ModuleQuery<T extends XyoQuery | void = void> = T extends XyoQuery ? ModuleQueryBase | T : ModuleQueryBase
