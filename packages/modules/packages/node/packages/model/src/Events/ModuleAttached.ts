import { EventData, ModuleEventArgs } from '@xyo-network/module'

export type ModuleAttachedEventArgs = ModuleEventArgs

export interface ModuleAttachedEventData extends EventData {
  moduleAttached: ModuleAttachedEventArgs
}
