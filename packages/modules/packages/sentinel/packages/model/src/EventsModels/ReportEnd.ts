import type { BoundWitness } from '@xyo-network/boundwitness-model'
import type { EventData } from '@xyo-network/module-events'
import type { Module, ModuleEventArgs } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

export type ReportEndEventArgs<T extends Module = Module> = ModuleEventArgs<
  T,
  {
    boundwitness?: BoundWitness
    inPayloads?: Payload[]
    outPayloads?: Payload[]
  }
>

export interface ReportEndEventData<T extends Module = Module> extends EventData {
  reportEnd: ReportEndEventArgs<T>
}
