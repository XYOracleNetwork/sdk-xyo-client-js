import type { EventData, Hash } from '@xylabs/sdk-js'
import type { ModuleEventArgs, QueryableModule } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

export type DeletedEventArgs<T extends QueryableModule = QueryableModule> = ModuleEventArgs<
  T, { hashes: Hash[]; payloads: Payload[] }
>

export interface DeletedEventData<T extends QueryableModule = QueryableModule> extends EventData {
  deleted: DeletedEventArgs<T>
}
