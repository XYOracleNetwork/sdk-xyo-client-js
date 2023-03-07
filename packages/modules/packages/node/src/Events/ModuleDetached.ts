import { ModuleEventArgs, ModuleEventEmitter } from '@xyo-network/module'

export type ModuleDetachedEventArgs = ModuleEventArgs

export type ModuleDetachedEventEmitter = ModuleEventEmitter<{ moduleDetached: ModuleDetachedEventArgs }>
