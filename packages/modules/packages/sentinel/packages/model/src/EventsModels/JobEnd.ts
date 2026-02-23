import type { Address, EventData } from '@xylabs/sdk-js'
import type { ModuleEventArgs, QueryableModule } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

export type JobEndEventArgs<T extends QueryableModule = QueryableModule> = ModuleEventArgs<
  T,
  {
    finalResult?: Record<Address, Payload[]>
    inPayloads?: Payload[]
  }
>

export interface JobEndEventData<T extends QueryableModule = QueryableModule> extends EventData {
  jobEnd: JobEndEventArgs<T>
}
