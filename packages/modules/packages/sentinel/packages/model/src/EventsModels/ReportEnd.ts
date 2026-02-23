import type { EventData } from '@xylabs/sdk-js'
import type { BoundWitness } from '@xyo-network/boundwitness-model'
import type { ModuleEventArgs, QueryableModule } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

export type ReportEndEventArgs<T extends QueryableModule = QueryableModule> = ModuleEventArgs<
  T,
  {
    boundwitness?: BoundWitness
    inPayloads?: Payload[]
    outPayloads?: Payload[]
  }
>

export interface ReportEndEventData<T extends QueryableModule = QueryableModule> extends EventData {
  reportEnd: ReportEndEventArgs<T>
}
