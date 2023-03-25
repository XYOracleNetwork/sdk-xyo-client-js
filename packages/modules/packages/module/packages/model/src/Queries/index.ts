import { Query } from '../Query'
import { ModuleDiscoverQuery } from './Discover'
import { ModuleSubscribeQuery } from './Subscribe'

export * from './Discover'
export * from './Subscribe'

export type ModuleQueryBase = ModuleSubscribeQuery | ModuleDiscoverQuery

export type ModuleQuery<T extends Query | void = void> = T extends Query ? ModuleQueryBase | T : ModuleQueryBase
