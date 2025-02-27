import { EventData } from '@xyo-network/module-events'
import { ModuleEventArgs, ModuleInstance } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export type ObserveStartEventArgs<T extends ModuleInstance = ModuleInstance, TIn extends Payload = Payload> = ModuleEventArgs<
  T,
  {
    inPayloads?: TIn[]
  }
>

export interface ObserveStartEventData<T extends ModuleInstance = ModuleInstance, TIn extends Payload = Payload> extends EventData {
  observeStart: ObserveStartEventArgs<T, TIn>
}
