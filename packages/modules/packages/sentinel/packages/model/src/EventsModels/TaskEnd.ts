import type { EventData } from '@xylabs/events'
import type { Address } from '@xylabs/hex'
import type { Module, ModuleEventArgs } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

export type TaskEndEventArgs<T extends Module = Module> = ModuleEventArgs<
  T,
  {
    address: Address
    inPayloads?: Payload[]
    name?: string
    outPayloads?: Payload[]
  }
>

export interface TaskEndEventData<T extends Module = Module> extends EventData {
  taskEnd: TaskEndEventArgs<T>
}
