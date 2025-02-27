import { Address } from '@xylabs/hex'
import { EventData } from '@xyo-network/module-events'
import { Module, ModuleEventArgs } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

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
