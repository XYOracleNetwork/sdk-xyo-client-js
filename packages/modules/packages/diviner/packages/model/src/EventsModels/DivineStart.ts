import { EventData } from '@xyo-network/module-events'
import { Module, ModuleEventArgs } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export type DivineStartEventArgs<T extends Module = Module, TIn extends Payload = Payload> = ModuleEventArgs<
  T,
  {
    inPayloads?: TIn[]
  }
>

export interface DivineStartEventData<T extends Module = Module, TIn extends Payload = Payload> extends EventData {
  divineStart: DivineStartEventArgs<T, TIn>
}
