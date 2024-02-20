import { Address } from '@xylabs/hex'

import { Module } from '../module'
import { ModuleResolverInstance } from './ModuleInstance'

export interface ModuleRepository extends ModuleResolverInstance {
  add(module: Module): this
  add(module: Module[]): this
  add(module: Module | Module[]): this

  remove(address: Address | string[]): this
}
