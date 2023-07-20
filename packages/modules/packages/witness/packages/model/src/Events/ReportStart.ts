import { EventData } from '@xyo-network/module'
import { ModuleEventArgs } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { WitnessModule } from '../Module'

export type WitnessReportStartEventArgs<T extends WitnessModule = WitnessModule> = ModuleEventArgs<
  T,
  {
    inPayloads?: Payload[]
  }
>

export interface WitnessReportStartEventData<T extends WitnessModule = WitnessModule> extends EventData {
  reportStart: WitnessReportStartEventArgs<T>
}
