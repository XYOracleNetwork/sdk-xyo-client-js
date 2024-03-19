import { Address } from '@xylabs/hex'
import { EventData } from '@xyo-network/module-events'
import { Module, ModuleEventArgs } from '@xyo-network/module-model'

export type ExposedEventArgs<T extends Module = Module> = ModuleEventArgs<T, { address: Address[] }>

export interface ExposedEventData<T extends Module = Module> extends EventData {
  expose: ExposedEventArgs<T>
}
