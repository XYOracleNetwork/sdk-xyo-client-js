import { Module, ModuleResolver } from './Module'

export interface ModuleRepository<TModule extends Module = Module> extends ModuleResolver<TModule> {
  add(module: Module, name?: string): this
  add(module: Module[], name?: string[]): this
  add(module: Module | Module[], name?: string | string[]): this

  remove(name: string | string[]): this
  remove(address: string | string[]): this
}
