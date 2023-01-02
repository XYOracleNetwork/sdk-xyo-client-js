import { Module } from './Module'
import { ModuleResolver } from './ModuleResolver'

export interface ModuleRepository<TModule extends Module = Module> extends ModuleResolver<TModule> {
  add(module: TModule, name?: string): this
  add(module: TModule[], name?: string[]): this
  add(module: TModule | TModule[], name?: string | string[]): this

  remove(name: string | string[]): this
  remove(address: string | string[]): this
}
