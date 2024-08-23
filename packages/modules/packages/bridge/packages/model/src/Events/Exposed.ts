import type { EventData } from '@xyo-network/module-events'
import type {
  Module, ModuleEventArgs, ModuleInstance,
} from '@xyo-network/module-model'

export type ExposedEventArgs<T extends Module = Module> = ModuleEventArgs<
  T,
  {
    modules: ModuleInstance[]
  }
>

export interface ExposedEventData<T extends Module = Module> extends EventData {
  exposed: ExposedEventArgs<T>
}
