import type { EventData } from '@xylabs/events'
import type { Module, ModuleEventArgs } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

export type DivineEndEventArgs<T extends Module = Module, TIn extends Payload = Payload, TOut extends Payload = Payload> = ModuleEventArgs<
  T,
  {
    errors: Error[]
    inPayloads: TIn[]
    outPayloads: TOut[]
  }
>

export interface DivineEndEventData<T extends Module = Module, TIn extends Payload = Payload, TOut extends Payload = Payload> extends EventData {
  divineEnd: DivineEndEventArgs<T, TIn, TOut>
}
