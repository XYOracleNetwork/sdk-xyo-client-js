import { EventData } from '@xyo-network/module'
import { Module, ModuleEventArgs } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export type DivineStartEventArgs<T extends Module = Module> = ModuleEventArgs<
  T,
  {
    inPayloads?: Payload[]
  }
>

export interface DivineStartEventData<T extends Module = Module> extends EventData {
  divineStart: DivineStartEventArgs<T>
}
