import type { EventData } from '@xylabs/sdk-js'
import type { ModuleEventArgs, QueryableModule } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

export type ReportStartEventArgs<T extends QueryableModule = QueryableModule> = ModuleEventArgs<
  T,
  {
    inPayloads?: Payload[]
  }
>

export interface ReportStartEventData<T extends QueryableModule = QueryableModule> extends EventData {
  reportStart: ReportStartEventArgs<T>
}
