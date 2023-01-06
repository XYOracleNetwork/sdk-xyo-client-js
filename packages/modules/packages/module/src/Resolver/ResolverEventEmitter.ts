import { Module, ModuleFilter, ModuleResolver } from '@xyo-network/module-model'

export class ResolverEventEmitter<T extends ModuleResolver = ModuleResolver> implements ModuleResolver {
  constructor(protected readonly resolver: T) {}

  get isModuleResolver(): boolean {
    return true
  }
  async resolve(filter?: ModuleFilter): Promise<Module[]> {
    const modules = await this.resolver.resolve(filter)
    return modules
  }
  async tryResolve(filter?: ModuleFilter): Promise<Module[]> {
    const modules = await this.resolver.tryResolve(filter)
    return modules
  }
}
