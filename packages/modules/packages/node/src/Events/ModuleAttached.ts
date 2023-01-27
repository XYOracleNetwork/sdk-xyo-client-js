import { ModuleEventEmitter } from '@xyo-network/module'
import { Module } from '@xyo-network/module-model'

export interface ModuleAttachedEventArgs {
  module: Module
  name?: string
}

export type ModuleAttachedEventEmitter = ModuleEventEmitter<'moduleAttached', ModuleAttachedEventArgs>
