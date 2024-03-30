import { ModuleManifestQuery } from './Manifest'
import { ModuleAddressQuery } from './ModuleAddress'
import { ModuleStateQuery } from './State'
import { ModuleSubscribeQuery } from './Subscribe'

export * from './Manifest'
export * from './ModuleAddress'
export * from './State'
export * from './Subscribe'

export type ModuleQueries = ModuleAddressQuery | ModuleSubscribeQuery | ModuleManifestQuery | ModuleStateQuery
