import type { EventData } from '@xylabs/events'
import type { ModuleEventArgs, ModuleInstance } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

export type ObserveEndEventArgs<
  T extends ModuleInstance = ModuleInstance,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
> = ModuleEventArgs<
  T,
  {
    errors?: Error[]
    inPayloads?: TIn[]
    outPayloads?: TOut[]
  }
>

export interface ObserveEndEventData<T extends ModuleInstance = ModuleInstance, TIn extends Payload = Payload, TOut extends Payload = Payload>
  extends EventData {
  observeEnd: ObserveEndEventArgs<T, TIn, TOut>
}
