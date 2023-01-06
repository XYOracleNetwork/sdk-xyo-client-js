import { Module, ModuleFilter, ModuleResolver } from '@xyo-network/module-model'

export interface ModuleResolvedEventArgs {
  filter?: ModuleFilter
  module: Module
}

type ListenerFunction = (args: ModuleResolvedEventArgs) => void

export class ResolverEventEmitter<T extends ModuleResolver = ModuleResolver> implements ModuleResolver {
  protected listeners: ListenerFunction[] = []
  constructor(protected readonly resolver: T) {}

  get isModuleResolver(): boolean {
    return true
  }

  emit(event: 'moduleResolved', args: ModuleResolvedEventArgs): boolean {
    if (this.listeners.length < 1) return false
    this.listeners.map((listener) => listener(args))
    return true
  }

  on(event: 'moduleResolved', listener: (args: ModuleResolvedEventArgs) => void): this {
    this.listeners.push(listener)
    return this
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
