import { IndirectModule, ModuleResolver } from './Module'

export interface ModuleRepository extends ModuleResolver {
  add(module: IndirectModule): this
  add(module: IndirectModule[]): this
  add(module: IndirectModule | IndirectModule[]): this

  remove(address: string | string[]): this
}
