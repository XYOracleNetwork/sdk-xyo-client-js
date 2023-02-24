import { ModuleEventArgs, ModuleEventEmitter } from '@xyo-network/module'

export type ModuleAttachedEvent = 'moduleAttached'
export const ModuleAttachedEvent: ModuleAttachedEvent = 'moduleAttached'

export type ModuleAttachedEventArgs = ModuleEventArgs

export type ModuleAttachedEventEmitter = ModuleEventEmitter<ModuleAttachedEvent, ModuleAttachedEventArgs>
