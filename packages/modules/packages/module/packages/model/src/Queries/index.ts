import { ModuleDescribeQuery } from './Describe'
import { ModuleDiscoverQuery } from './Discover'
import { ModuleManifestQuery } from './Manifest'
import { ModuleAddressQuery } from './ModuleAddress'
import { ModuleStateQuery } from './State'
import { ModuleSubscribeQuery } from './Subscribe'

export * from './Describe'
export * from './Discover'
export * from './Manifest'
export * from './ModuleAddress'
export * from './State'
export * from './Subscribe'

export type ModuleQueries =
  | ModuleDiscoverQuery
  | ModuleAddressQuery
  | ModuleSubscribeQuery
  | ModuleDescribeQuery
  | ModuleManifestQuery
  | ModuleStateQuery
