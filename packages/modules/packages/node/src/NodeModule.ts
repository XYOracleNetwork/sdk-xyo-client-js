import { Module } from '@xyo-network/module'
import { Promisable, PromisableArray } from '@xyo-network/promise'

import { Node } from './Node'

export interface NodeModule<TModule extends Module = Module> extends Node, Module {
  registeredModules(): PromisableArray<TModule>
  attachedModules(): PromisableArray<TModule>
  resolve(address: string): Promisable<TModule | null>
  register(module: TModule): Promisable<void>
}
