import { Query } from '../Query'
import { ModuleDiscoverQuery } from './Discover'
import { ModuleAccountQuery } from './ModuleAccount'
import { ModuleSubscribeQuery } from './Subscribe'

export * from './Discover'
export * from './ModuleAccount'
export * from './Subscribe'

export type ModuleQueryBase = ModuleDiscoverQuery | ModuleAccountQuery | ModuleSubscribeQuery

export type ModuleQuery<T extends Query | void = void> = T extends Query ? ModuleQueryBase | T : ModuleQueryBase
