import type { Address, EventData } from '@xylabs/sdk-js'
import type { ModuleEventArgs, QueryableModule } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

export type TaskEndEventArgs<T extends QueryableModule = QueryableModule> = ModuleEventArgs<
  T,
  {
    address: Address
    inPayloads?: Payload[]
    name?: string
    outPayloads?: Payload[]
  }
>

export interface TaskEndEventData<T extends QueryableModule = QueryableModule> extends EventData {
  taskEnd: TaskEndEventArgs<T>
}
