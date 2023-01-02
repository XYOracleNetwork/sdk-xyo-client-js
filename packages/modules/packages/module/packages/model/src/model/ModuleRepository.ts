import { Module } from './Module'
import { ModuleResolver } from './ModuleResolver'

export interface ModuleRepository<TModule extends Module = Module> extends ModuleResolver {
  add(module: TModule, name?: string): ModuleRepository<TModule>
  add(module: TModule[], name?: string[]): ModuleRepository<TModule>
  add(module: TModule | TModule[], name?: string | string[]): ModuleRepository<TModule>

  remove(name: string | string[]): ModuleRepository<TModule>
  remove(address: string | string[]): ModuleRepository<TModule>
}
