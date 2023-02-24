import { ModuleEventArgs, ModuleEventEmitter } from '@xyo-network/module'

export type ModuleRegisteredEvent = 'moduleRegistered'
export const ModuleRegisteredEvent: ModuleRegisteredEvent = 'moduleRegistered'

export type ModuleRegisteredEventArgs = ModuleEventArgs

export type ModuleRegisteredEventEmitter = ModuleEventEmitter<ModuleRegisteredEvent, ModuleRegisteredEventArgs>
