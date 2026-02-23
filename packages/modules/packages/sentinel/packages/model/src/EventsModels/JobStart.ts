import type { EventData } from '@xylabs/sdk-js'
import type { ModuleEventArgs, QueryableModule } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

export type JobStartEventArgs<T extends QueryableModule = QueryableModule> = ModuleEventArgs<
  T,
  {
    inPayloads?: Payload[]
  }
>

export interface JobStartEventData<T extends QueryableModule = QueryableModule> extends EventData {
  jobStart: JobStartEventArgs<T>
}
