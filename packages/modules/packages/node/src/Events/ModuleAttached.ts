import { ModuleEventEmitter } from '@xyo-network/module'
import { Module } from '@xyo-network/module-model'

export interface ModuleAttachedEventArgs {
  module: Module
}

export interface ModuleDetachedEventArgs {
  address: string
}

export type ModuleAttachedEventEmitter = ModuleEventEmitter<'moduleAttached', ModuleAttachedEventArgs>
export type ModuleDetachedEventEmitter = ModuleEventEmitter<'moduleDetached', ModuleDetachedEventArgs>
