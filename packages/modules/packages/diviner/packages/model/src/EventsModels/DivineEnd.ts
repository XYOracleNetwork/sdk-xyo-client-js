import { EventData } from '@xyo-network/module-events'
import { Module, ModuleEventArgs } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export type DivineEndEventArgs<T extends Module = Module> = ModuleEventArgs<
  T,
  {
    errors?: Error[]
    inPayloads?: Payload[]
    outPayloads?: Payload[]
  }
>

export interface DivineEndEventData<T extends Module = Module> extends EventData {
  observeEnd: DivineEndEventArgs<T>
}
