import type { EventData } from '@xylabs/events'
import type { Hash } from '@xylabs/hex'
import type { Module, ModuleEventArgs } from '@xyo-network/module-model'

export type DeletedEventArgs<T extends Module = Module> = ModuleEventArgs<
  T, { hashes: Hash[] }
>

export interface DeletedEventData<T extends Module = Module> extends EventData {
  deleted: DeletedEventArgs<T>
}
