import { Promisable } from '@xyo-network/promise'

import { Module } from './Module'
import { ModuleFilter } from './ModuleFilter'

export interface ModuleResolver {
  isModuleResolver: boolean
  resolve(filter?: ModuleFilter): Promisable<Module[]>
}
