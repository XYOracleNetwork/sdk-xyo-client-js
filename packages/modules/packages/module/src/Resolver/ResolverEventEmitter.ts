import { Module, ModuleFilter, ModuleResolver } from '@xyo-network/module-model'

export interface ModuleResolvedEventArgs {
  filter?: ModuleFilter
  module: Module
}

type ListenerFunction = (args: ModuleResolvedEventArgs) => void

export interface IResolverEventEmitter {
  on(event: 'moduleResolved', listener: (args: ModuleResolvedEventArgs) => void): void
}

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

const getMixin = <T extends ModuleResolver = ModuleResolver>(resolver: T) => {
  const listeners: ListenerFunction[] = []
  const emit = (event: 'moduleResolved', args: ModuleResolvedEventArgs): boolean => {
    if (listeners.length < 1) return false
    listeners.map((listener) => listener(args))
    return true
  }
  const onModuleResolved = (module: Module, filter?: ModuleFilter) => {
    const args = { filter, module }
    emit('moduleResolved', args)
  }
  const on = (event: 'moduleResolved', listener: (args: ModuleResolvedEventArgs) => void) => {
    listeners.push(listener)
  }
  const { resolve, tryResolve } = resolver
  function originalResolve(filter?: ModuleFilter) {
    return resolve.bind(resolver)(filter)
  }
  function originalTryResolve(filter?: ModuleFilter) {
    return tryResolve.bind(resolver)(filter)
  }
  return {
    on,
    resolve: async (filter?: ModuleFilter): Promise<Module[]> => {
      const modules: Module[] = await originalResolve(filter)
      await Promise.allSettled(modules.map((mod) => onModuleResolved(mod, filter)))
      return modules
    },
    tryResolve: async (filter?: ModuleFilter): Promise<Module[]> => {
      const modules: Module[] = await originalTryResolve(filter)
      await Promise.allSettled(modules.map((mod) => onModuleResolved(mod, filter)))
      return modules
    },
  }
}

export const decorateExisting = <T extends ModuleResolver = ModuleResolver>(resolver: T): T & IResolverEventEmitter => {
  const mixin = getMixin(resolver)
  const ret = Object.assign(resolver, mixin)
  return ret
}
