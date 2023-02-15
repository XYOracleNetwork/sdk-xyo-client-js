import { Module, ModuleResolver } from '@xyo-network/module-model'
import { Promisable } from '@xyo-network/promise'

export interface Node {
  attach(address: string, name?: string, external?: boolean): Promisable<void>
  attached(): Promisable<string[]>
  detach(address: string): Promisable<void>
  registered(): Promisable<string[]>
}

export type NodeModule = Node & Module & ModuleResolver<Module>
