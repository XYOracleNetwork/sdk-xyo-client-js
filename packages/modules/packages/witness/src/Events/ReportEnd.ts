import { EventData, ModuleEventArgs } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'

import { WitnessModule } from '../Witness'

export type WitnessReportEndEventArgs = ModuleEventArgs<
  WitnessModule,
  {
    errors?: Error[]
    inPayloads?: XyoPayload[]
    outPayloads?: XyoPayload[]
  }
>

export interface WitnessReportEndEventData extends EventData {
  reportEnd: WitnessReportEndEventArgs
}
