import { ModuleEventArgs, ModuleEventEmitter } from '@xyo-network/module'

export type ModuleDetachedEvent = 'moduleDetached'
export const ModuleDetachedEvent: ModuleDetachedEvent = 'moduleDetached'

export type ModuleDetachedEventArgs = ModuleEventArgs

export type ModuleDetachedEventEmitter = ModuleEventEmitter<ModuleDetachedEvent, ModuleDetachedEventArgs>
