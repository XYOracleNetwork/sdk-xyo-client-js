import { EventData, ModuleEventArgs } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'

import { WitnessModule } from '../Witness'

export type WitnessReportStartEventArgs = ModuleEventArgs<
  WitnessModule,
  {
    inPayloads?: XyoPayload[]
  }
>

export interface WitnessReportStartEventData extends EventData {
  reportStart: WitnessReportStartEventArgs
}
