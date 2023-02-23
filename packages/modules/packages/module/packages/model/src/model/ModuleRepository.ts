import { Module, ModuleResolver } from './Module'

export interface ModuleRepository<TModule extends Module = Module> extends ModuleResolver<TModule> {
  add(module: Module): this
  add(module: Module[]): this
  add(module: Module | Module[]): this

  remove(address: string | string[]): this
}
