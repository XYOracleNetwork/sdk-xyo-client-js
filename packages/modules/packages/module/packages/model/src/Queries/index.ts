import { Query } from '../Query'
import { ModuleDiscoverQuery } from './Discover'
import { ModuleAddressQuery } from './ModuleAddress'
import { ModuleSubscribeQuery } from './Subscribe'

export * from './Discover'
export * from './ModuleAddress'
export * from './Subscribe'

export type ModuleQueryBase = ModuleDiscoverQuery | ModuleAddressQuery | ModuleSubscribeQuery

export type ModuleQuery<T extends Query | void = void> = T extends Query ? ModuleQueryBase | T : ModuleQueryBase
