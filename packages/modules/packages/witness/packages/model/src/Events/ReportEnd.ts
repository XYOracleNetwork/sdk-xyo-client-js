import { EventData } from '@xyo-network/module'
import { Module, ModuleEventArgs } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export type WitnessReportEndEventArgs<T extends Module = Module> = ModuleEventArgs<
  T,
  {
    errors?: Error[]
    inPayloads?: Payload[]
    outPayloads?: Payload[]
  }
>

export interface WitnessReportEndEventData<T extends Module = Module> extends EventData {
  reportEnd: WitnessReportEndEventArgs<T>
}
