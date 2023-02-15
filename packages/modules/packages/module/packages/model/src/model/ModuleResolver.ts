import { Promisable } from '@xyo-network/promise'

import { ModuleFilter } from '../ModuleFilter'
import { Module } from './Module'

export interface ModuleResolver {
  isModuleResolver: boolean
  resolve(filter?: ModuleFilter): Promisable<Module[]>
}
