import { EventData } from '@xyo-network/module'
import { ModuleEventArgs } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { WitnessModule } from '../Module'

export type WitnessReportEndEventArgs = ModuleEventArgs<
  WitnessModule,
  {
    errors?: Error[]
    inPayloads?: Payload[]
    outPayloads?: Payload[]
  }
>

export interface WitnessReportEndEventData extends EventData {
  reportEnd: WitnessReportEndEventArgs
}
