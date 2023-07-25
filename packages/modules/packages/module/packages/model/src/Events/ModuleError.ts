import { EventData } from '@xyo-network/module-events'

import { Module, ModuleEventArgs } from '../module'

export type ModuleErrorEventArgs<TModule extends Module = Module> = ModuleEventArgs<TModule, { error: Error }>

export interface ModuleErrorEventData extends EventData {
  moduleError: ModuleErrorEventArgs
}
