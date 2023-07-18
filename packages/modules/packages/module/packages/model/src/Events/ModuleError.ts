import { EventData } from '@xyo-network/module-events'

import { ModuleEventArgs, ModuleInstance } from '../Module'

export type ModuleErrorEventArgs<TModule extends ModuleInstance = ModuleInstance> = ModuleEventArgs<TModule, { error: Error }>

export interface ModuleErrorEventData extends EventData {
  moduleError: ModuleErrorEventArgs
}
