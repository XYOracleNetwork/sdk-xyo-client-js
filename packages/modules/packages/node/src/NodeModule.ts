import { Module, ModuleResolver } from '@xyo-network/module'
import { Promisable, PromisableArray } from '@xyo-network/promise'

import { Node } from './Node'

export interface NodeModule<TModule extends Module = Module> extends Node, Module, ModuleResolver {
  attachedModules(): PromisableArray<TModule>
  register(module: TModule): Promisable<void>
  registeredModules(): PromisableArray<TModule>
  unregister(module: TModule): Promisable<void>
}
