import { Promisable } from '@xyo-network/promise'

import { Module, ModuleFilter } from './Module'

export interface ModuleResolver {
  isModuleResolver: boolean
  resolve(filter: ModuleFilter): Promisable<Module[]>
}
