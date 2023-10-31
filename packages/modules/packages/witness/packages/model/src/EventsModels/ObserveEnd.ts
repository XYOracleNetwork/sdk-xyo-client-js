import { EventData } from '@xyo-network/module-events'
import { Module, ModuleEventArgs } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export type ObserveEndEventArgs<T extends Module = Module, TIn extends Payload = Payload, TOut extends Payload = Payload> = ModuleEventArgs<
  T,
  {
    errors?: Error[]
    inPayloads?: TIn[]
    outPayloads?: TOut[]
  }
>

export interface ObserveEndEventData<T extends Module = Module, TIn extends Payload = Payload, TOut extends Payload = Payload> extends EventData {
  observeEnd: ObserveEndEventArgs<T, TIn, TOut>
}
