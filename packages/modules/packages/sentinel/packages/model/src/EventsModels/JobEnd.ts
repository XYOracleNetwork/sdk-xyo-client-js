import type { Address } from '@xylabs/hex'
import type { EventData } from '@xyo-network/module-events'
import type { Module, ModuleEventArgs } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

export type JobEndEventArgs<T extends Module = Module> = ModuleEventArgs<
  T,
  {
    finalResult?: Record<Address, Payload[]>
    inPayloads?: Payload[]
  }
>

export interface JobEndEventData<T extends Module = Module> extends EventData {
  jobEnd: JobEndEventArgs<T>
}
