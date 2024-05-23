import { EventData } from '@xyo-network/module-events'
import { ModuleEventArgs, ModuleInstance } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

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
