import { Promisable } from '@xyo-network/promise'

import { ModuleFilter } from '../ModuleFilter'
import { Module } from './Module'

export interface ModuleResolver<TModule extends Module = Module> {
  isModuleResolver: boolean
  resolve(filter?: ModuleFilter): Promisable<TModule[]>
  tryResolve(filter?: ModuleFilter): Promisable<TModule[]>
}
