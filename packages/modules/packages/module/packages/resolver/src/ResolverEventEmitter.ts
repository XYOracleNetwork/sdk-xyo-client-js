import type {
  ModuleIdentifier, ModuleResolver,
  QueryableModule,
} from '@xyo-network/module-model'

export interface ModuleResolvedEventArgs {
  id?: ModuleIdentifier
  mod: QueryableModule
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
  const onModuleResolved = (mod: QueryableModule, id?: ModuleIdentifier) => {
    const args = { id, mod }
    emit('moduleResolved', args)
  }

  const { resolve } = resolver
  function originalResolve(filter?: ModuleIdentifier) {
    return resolve.bind(resolver)(filter)
  }

  return {
    on: (event: 'moduleResolved', listener: (args: ModuleResolvedEventArgs) => void) => {
      listeners.push(listener)
    },
    resolve: async (id?: ModuleIdentifier): Promise<QueryableModule[]> => {
      const modulesResult = await originalResolve(id) ?? []
      const modules = Array.isArray(modulesResult) ? modulesResult : [modulesResult]

      await Promise.allSettled(modules.map(mod => onModuleResolved(mod, id)))
      return modules
    },
  }
}

export const mixinResolverEventEmitter = <T extends ModuleResolver = ModuleResolver>(resolver: T): T & ResolverEventEmitter => {
  const mixin = getMixin(resolver)
  return Object.assign(resolver, mixin)
}
