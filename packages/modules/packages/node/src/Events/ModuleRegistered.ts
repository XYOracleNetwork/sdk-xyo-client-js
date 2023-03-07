import { ModuleEventArgs, ModuleEventEmitter } from '@xyo-network/module'

export type ModuleRegisteredEventArgs = ModuleEventArgs

export type ModuleRegisteredEventEmitter = ModuleEventEmitter<{ moduleRegistered: ModuleRegisteredEventArgs }>
