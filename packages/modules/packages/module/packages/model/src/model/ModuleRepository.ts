import { Module } from './Module'
import { ModuleResolver } from './ModuleResolver'

export interface ModuleRepository extends ModuleResolver {
  add(module: Module, name?: string): this
  add(module: Module[], name?: string[]): this
  add(module: Module | Module[], name?: string | string[]): this

  remove(name: string | string[]): this
  remove(address: string | string[]): this
}
