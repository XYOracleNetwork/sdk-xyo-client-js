import type { EventData } from '@xyo-network/module-events'
import type { ModuleEventArgs, ModuleInstance } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

export type ObserveStartEventArgs<T extends ModuleInstance = ModuleInstance, TIn extends Payload = Payload> = ModuleEventArgs<
  T,
  {
    inPayloads?: TIn[]
  }
>

export interface ObserveStartEventData<T extends ModuleInstance = ModuleInstance, TIn extends Payload = Payload> extends EventData {
  observeStart: ObserveStartEventArgs<T, TIn>
}
