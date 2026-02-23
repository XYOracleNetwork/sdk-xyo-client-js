import type { EventData } from '@xylabs/sdk-js'
import type {
  ModuleEventArgs, ModuleInstance,
  QueryableModule,
} from '@xyo-network/module-model'

export type ExposedEventArgs<T extends QueryableModule = QueryableModule> = ModuleEventArgs<
  T,
  {
    modules: ModuleInstance[]
  }
>

export interface ExposedEventData<T extends QueryableModule = QueryableModule> extends EventData {
  exposed: ExposedEventArgs<T>
}
