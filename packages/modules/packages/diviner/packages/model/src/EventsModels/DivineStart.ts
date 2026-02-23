import type { EventData } from '@xylabs/sdk-js'
import type { ModuleEventArgs, QueryableModule } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

export type DivineStartEventArgs<T extends QueryableModule = QueryableModule, TIn extends Payload = Payload> = ModuleEventArgs<
  T,
  {
    inPayloads: TIn[]
  }
>

export interface DivineStartEventData<T extends QueryableModule = QueryableModule, TIn extends Payload = Payload> extends EventData {
  divineStart: DivineStartEventArgs<T, TIn>
}
