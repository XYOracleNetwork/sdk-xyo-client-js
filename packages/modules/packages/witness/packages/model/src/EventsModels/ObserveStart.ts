import { EventData } from '@xyo-network/module-events'
import { Module, ModuleEventArgs } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export type ObserveStartEventArgs<T extends Module = Module, TIn extends Payload = Payload> = ModuleEventArgs<
  T,
  {
    inPayloads?: TIn[]
  }
>

export interface ObserveStartEventData<T extends Module = Module, TIn extends Payload = Payload> extends EventData {
  observeStart: ObserveStartEventArgs<T, TIn>
}
