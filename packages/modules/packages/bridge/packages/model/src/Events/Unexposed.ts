import type { EventData } from '@xylabs/sdk-js'
import type {
  Module, ModuleEventArgs, ModuleInstance,
} from '@xyo-network/module-model'

export type UnexposedEventArgs<T extends Module = Module> = ModuleEventArgs<
  T,
  {
    modules: ModuleInstance[]
  }
>

export interface UnexposedEventData<T extends Module = Module> extends EventData {
  unexposed: UnexposedEventArgs<T>
}
