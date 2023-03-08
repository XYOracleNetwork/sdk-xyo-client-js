import { EventData, ModuleEventArgs } from '@xyo-network/module'

export type ModuleDetachedEventArgs = ModuleEventArgs

export interface ModuleDetachedEventData extends EventData {
  moduleDetached: ModuleDetachedEventArgs
}
