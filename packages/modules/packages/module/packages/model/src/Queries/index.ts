import { Query } from '@xyo-network/payload-model'

import { ModuleDescribeQuery } from './Describe'
import { ModuleDiscoverQuery } from './Discover'
import { ModuleManifestQuery } from './Manifest'
import { ModuleAddressQuery } from './ModuleAddress'
import { ModuleSubscribeQuery } from './Subscribe'

export * from './Describe'
export * from './Discover'
export * from './Manifest'
export * from './ModuleAddress'
export * from './Subscribe'

export type ModuleQueryBase = ModuleDiscoverQuery | ModuleAddressQuery | ModuleSubscribeQuery | ModuleDescribeQuery | ModuleManifestQuery

export type ModuleQuery<T extends Query | void = void> = T extends Query ? ModuleQueryBase | T : ModuleQueryBase
