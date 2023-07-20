import { EventData } from '@xyo-network/module'
import { ModuleEventArgs } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { WitnessModule } from '../Module'

export type WitnessReportEndEventArgs<T extends WitnessModule = WitnessModule> = ModuleEventArgs<
  T,
  {
    errors?: Error[]
    inPayloads?: Payload[]
    outPayloads?: Payload[]
  }
>

export interface WitnessReportEndEventData<T extends WitnessModule = WitnessModule> extends EventData {
  reportEnd: WitnessReportEndEventArgs<T>
}
