import { Module, ModuleFilter, ModuleResolver } from '@xyo-network/module-model'
import { EventEmitter } from 'events'

export interface ModuleResolvedEventArgs {
  filter?: ModuleFilter
  module: Module
}

export declare interface ResolverEventEmitter {
  emit(event: 'moduleResolved', args: ModuleResolvedEventArgs): boolean
  on(event: 'moduleResolved', listener: (args: ModuleResolvedEventArgs) => void): this
}

export class ResolverEventEmitter<T extends ModuleResolver = ModuleResolver> extends EventEmitter implements ModuleResolver {
  constructor(protected readonly resolver: T) {
    super()
  }

  get isModuleResolver(): boolean {
    return true
  }

  async resolve(filter?: ModuleFilter): Promise<Module[]> {
    const modules = await this.resolver.resolve(filter)
    await Promise.allSettled(modules.map((mod) => this.onModuleResolved(mod, filter)))
    return modules
  }

  async tryResolve(filter?: ModuleFilter): Promise<Module[]> {
    const modules = await this.resolver.tryResolve(filter)
    await Promise.allSettled(modules.map((mod) => this.onModuleResolved(mod, filter)))
    return modules
  }

  protected onModuleResolved(module: Module, filter?: ModuleFilter): void {
    const args = { filter, module }
    this.emit('moduleResolved', args)
  }
}
