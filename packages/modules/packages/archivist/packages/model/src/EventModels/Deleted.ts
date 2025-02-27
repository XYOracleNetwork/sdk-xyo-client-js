import { Hash } from '@xylabs/hex'
import { EventData } from '@xyo-network/module-events'
import { Module, ModuleEventArgs } from '@xyo-network/module-model'

export type DeletedEventArgs<T extends Module = Module> = ModuleEventArgs<
  T,
  {
    hashes: Hash[]
  }
>

export interface DeletedEventData<T extends Module = Module> extends EventData {
  deleted: DeletedEventArgs<T>
}
