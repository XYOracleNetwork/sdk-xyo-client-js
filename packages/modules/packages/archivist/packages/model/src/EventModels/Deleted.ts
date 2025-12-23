import type { EventData, Hash } from '@xylabs/sdk-js'
import type { Module, ModuleEventArgs } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

export type DeletedEventArgs<T extends Module = Module> = ModuleEventArgs<
  T, { hashes: Hash[]; payloads: Payload[] }
>

export interface DeletedEventData<T extends Module = Module> extends EventData {
  deleted: DeletedEventArgs<T>
}
