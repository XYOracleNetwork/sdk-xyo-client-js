import { ModuleEventEmitter } from '@xyo-network/module'
import { ModuleResolver } from '@xyo-network/module-model'

export interface ModuleResolverChangedEventArgs {
  resolver?: ModuleResolver
}

export type ResolverChangedEventEmitter = ModuleEventEmitter<'moduleResolverChanged', ModuleResolverChangedEventArgs>
