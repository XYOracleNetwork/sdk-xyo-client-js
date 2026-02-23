import type { EventData } from '@xylabs/sdk-js'
import type {
  ModuleEventArgs, ModuleInstance,
  QueryableModule,
} from '@xyo-network/module-model'

export type UnexposedEventArgs<T extends QueryableModule = QueryableModule> = ModuleEventArgs<
  T,
  {
    modules: ModuleInstance[]
  }
>

export interface UnexposedEventData<T extends QueryableModule = QueryableModule> extends EventData {
  unexposed: UnexposedEventArgs<T>
}
