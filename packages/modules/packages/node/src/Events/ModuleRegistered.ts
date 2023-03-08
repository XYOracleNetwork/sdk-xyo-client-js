import { EventData, ModuleEventArgs } from '@xyo-network/module'

export type ModuleRegisteredEventArgs = ModuleEventArgs

export interface ModuleRegisteredEventData extends EventData {
  moduleRegistered: ModuleRegisteredEventArgs
}
