import type { Hash } from '@xylabs/hex'
import type { EventData } from '@xyo-network/module-events'
import type { Module, ModuleEventArgs } from '@xyo-network/module-model'

export type DeletedEventArgs<T extends Module = Module> = ModuleEventArgs<
  T, { hashes: Hash[] }
>

export interface DeletedEventData<T extends Module = Module> extends EventData {
  deleted: DeletedEventArgs<T>
}
