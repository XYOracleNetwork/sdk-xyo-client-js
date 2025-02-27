import type { EventData } from '@xyo-network/module-events'
import type { Module, ModuleEventArgs } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

export type JobStartEventArgs<T extends Module = Module> = ModuleEventArgs<
  T,
  {
    inPayloads?: Payload[]
  }
>

export interface JobStartEventData<T extends Module = Module> extends EventData {
  jobStart: JobStartEventArgs<T>
}
