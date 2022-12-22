import { XyoQuery } from '../Query'
import { AbstractModuleDiscoverQuery } from './Discover'
import { AbstractModuleSubscribeQuery } from './Subscribe'

export * from './Discover'
export * from './Subscribe'

export type AbstractModuleQueryBase = AbstractModuleSubscribeQuery | AbstractModuleDiscoverQuery

export type AbstractModuleQuery<T extends XyoQuery | void = void> = T extends XyoQuery ? AbstractModuleQueryBase | T : AbstractModuleQueryBase
