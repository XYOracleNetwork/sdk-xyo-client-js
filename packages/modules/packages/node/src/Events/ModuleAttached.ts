import { ModuleEventEmitter } from '@xyo-network/module'
import { Module } from '@xyo-network/module-model'

export interface ModuleAttachedEventArgs {
  module: Module
  name?: string
}

export interface ModuleDetachedEventArgs {
  module: Module
  name?: string
}

export type ModuleAttachedEventEmitter = ModuleEventEmitter<'moduleAttached', ModuleAttachedEventArgs>
export type ModuleDetachedEventEmitter = ModuleEventEmitter<'moduleDetached', ModuleDetachedEventArgs>
