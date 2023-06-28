import { ModuleEventArgs } from "@xyo-network/module-model"
import { EventData } from '@xyo-network/module'
import { Payload } from "@xyo-network/payload-model"
import { WitnessModule } from "../Module"

export interface WitnessReportStartEventData extends EventData {
  reportStart: WitnessReportStartEventArgs
}


export type WitnessReportStartEventArgs = ModuleEventArgs<
  WitnessModule,
  {
    inPayloads?: Payload[]
  }
>