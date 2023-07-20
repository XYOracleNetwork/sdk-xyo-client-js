import { Module, ModuleResolver } from './module-fix'

export interface ModuleRepository extends ModuleResolver {
  add(module: Module): this
  add(module: Module[]): this
  add(module: Module | Module[]): this

  remove(address: string | string[]): this
}
