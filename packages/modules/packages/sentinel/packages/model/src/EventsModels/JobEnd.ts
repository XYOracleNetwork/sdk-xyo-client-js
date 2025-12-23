import type { Address, EventData } from '@xylabs/sdk-js'
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
