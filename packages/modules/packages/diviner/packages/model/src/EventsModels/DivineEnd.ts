import type { EventData } from '@xylabs/sdk-js'
import type { ModuleEventArgs, QueryableModule } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

export type DivineEndEventArgs<T extends QueryableModule = QueryableModule, TIn extends Payload = Payload, TOut extends Payload = Payload> = ModuleEventArgs<
  T,
  {
    errors: Error[]
    inPayloads: TIn[]
    outPayloads: TOut[]
  }
>

export interface DivineEndEventData<T extends QueryableModule = QueryableModule,
  TIn extends Payload = Payload, TOut extends Payload = Payload> extends EventData {
  divineEnd: DivineEndEventArgs<T, TIn, TOut>
}
