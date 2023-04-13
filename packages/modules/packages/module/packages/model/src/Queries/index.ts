import { Query } from '../Query'
import { ModuleDiscoverQuery } from './Discover'
import { ModulePreviousHashQuery } from './PreviousHash'
import { ModuleSubscribeQuery } from './Subscribe'

export * from './Discover'
export * from './PreviousHash'
export * from './Subscribe'

export type ModuleQueryBase = ModuleDiscoverQuery | ModulePreviousHashQuery | ModuleSubscribeQuery

export type ModuleQuery<T extends Query | void = void> = T extends Query ? ModuleQueryBase | T : ModuleQueryBase
