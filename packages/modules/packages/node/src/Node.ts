import { Module, ModuleResolver } from '@xyo-network/module-model'
import { Promisable } from '@xyo-network/promise'

export interface Node {
  attach(address: string, name?: string): Promisable<void>
  attached(): Promisable<string[]>
  detach(address: string): Promisable<void>
  registered(): Promisable<string[]>
}

export type NodeModule<TModule extends Module = Module> = Node & Module & ModuleResolver<TModule>
