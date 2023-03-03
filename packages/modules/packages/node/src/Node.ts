import { EventModule } from '@xyo-network/module-model'
import { Promisable } from '@xyo-network/promise'

import { NodeConfig } from './Config'
import { ModuleAttachedEventEmitter, ModuleDetachedEventEmitter, ModuleRegisteredEventEmitter } from './Events'

export interface Node {
  attach(address: string, external?: boolean): Promisable<void>
  attached(): Promisable<string[]>
  detach(address: string): Promisable<void>
  registered(): Promisable<string[]>
}

export type NodeModule = Node & EventModule<NodeConfig, ModuleAttachedEventEmitter | ModuleDetachedEventEmitter | ModuleRegisteredEventEmitter>
