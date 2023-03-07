import { ModuleEventArgs, ModuleEventEmitter } from '@xyo-network/module'

export type ModuleAttachedEventArgs = ModuleEventArgs

export type ModuleAttachedEventEmitter = ModuleEventEmitter<{ moduleAttached: ModuleAttachedEventArgs }>
