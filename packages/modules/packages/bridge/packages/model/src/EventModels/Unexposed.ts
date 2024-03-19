import { Address } from '@xylabs/hex'
import { EventData } from '@xyo-network/module-events'
import { Module, ModuleEventArgs } from '@xyo-network/module-model'

export type UnexposedEventArgs<T extends Module = Module> = ModuleEventArgs<T, { address: Address[] }>

export interface UnexposedEventData<T extends Module = Module> extends EventData {
  unexpose: UnexposedEventArgs<T>
}
