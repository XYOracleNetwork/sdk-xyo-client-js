import { EventData } from '@xyo-network/module'
import { Module, ModuleEventArgs } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export type WitnessReportStartEventArgs<T extends Module = Module> = ModuleEventArgs<
  T,
  {
    inPayloads?: Payload[]
  }
>

export interface WitnessReportStartEventData<T extends Module = Module> extends EventData {
  reportStart: WitnessReportStartEventArgs<T>
}
