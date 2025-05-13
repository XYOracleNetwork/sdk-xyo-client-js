import type { EventData } from '@xylabs/events'
import type { Module, ModuleEventArgs } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

export type ReportStartEventArgs<T extends Module = Module> = ModuleEventArgs<
  T,
  {
    inPayloads?: Payload[]
  }
>

export interface ReportStartEventData<T extends Module = Module> extends EventData {
  reportStart: ReportStartEventArgs<T>
}
