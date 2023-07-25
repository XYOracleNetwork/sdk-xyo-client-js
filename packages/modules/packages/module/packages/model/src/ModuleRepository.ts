import { Module, ModuleResolver } from './module'

export interface ModuleRepository extends ModuleResolver {
  add(module: Module): this
  add(module: Module[]): this
  add(module: Module | Module[]): this

  remove(address: string | string[]): this
}
