import { Address } from '@xylabs/hex'
import { EventData } from '@xyo-network/module-events'
import { Module, ModuleEventArgs } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export type TaskStartEventArgs<T extends Module = Module> = ModuleEventArgs<
  T,
  {
    address: Address
    inPayloads?: Payload[]
    name?: string
  }
>

export interface TaskStartEventData<T extends Module = Module> extends EventData {
  taskStart: TaskStartEventArgs<T>
}
