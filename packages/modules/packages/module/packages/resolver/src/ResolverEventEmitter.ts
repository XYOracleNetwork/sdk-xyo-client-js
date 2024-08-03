import { Module, ModuleFilter, ModuleResolver } from '@xyo-network/module-model'

export interface ModuleResolvedEventArgs {
  filter?: ModuleFilter
  mod: Module
}

export interface ResolverEventEmitter {
  on(event: 'moduleResolved', listener: (args: ModuleResolvedEventArgs) => void): void
}

type ListenerFunction = (args: ModuleResolvedEventArgs) => void

const getMixin = <T extends ModuleResolver = ModuleResolver>(resolver: T) => {
  const listeners: ListenerFunction[] = []
  const emit = (event: 'moduleResolved', args: ModuleResolvedEventArgs): boolean => {
    if (listeners.length === 0) return false
    for (const listener of listeners) listener(args)
    return true
  }
  const onModuleResolved = (mod: Module, filter?: ModuleFilter) => {
    const args = { filter, mod }
    emit('moduleResolved', args)
  }

  const { resolve } = resolver
  function originalResolve(filter?: ModuleFilter) {
    return resolve.bind(resolver)(filter)
  }

  return {
    on: (event: 'moduleResolved', listener: (args: ModuleResolvedEventArgs) => void) => {
      listeners.push(listener)
    },
    resolve: async (filter?: ModuleFilter): Promise<Module[]> => {
      const modules: Module[] = await originalResolve(filter)
      await Promise.allSettled(modules.map(mod => onModuleResolved(mod, filter)))
      return modules
    },
  }
}

export const mixinResolverEventEmitter = <T extends ModuleResolver = ModuleResolver>(resolver: T): T & ResolverEventEmitter => {
  const mixin = getMixin(resolver)
  return Object.assign(resolver, mixin)
}
