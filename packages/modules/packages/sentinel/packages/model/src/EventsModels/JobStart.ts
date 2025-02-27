import { EventData } from '@xyo-network/module-events'
import { Module, ModuleEventArgs } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export type JobStartEventArgs<T extends Module = Module> = ModuleEventArgs<
  T,
  {
    inPayloads?: Payload[]
  }
>

export interface JobStartEventData<T extends Module = Module> extends EventData {
  jobStart: JobStartEventArgs<T>
}
