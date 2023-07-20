import { ModuleEventData } from '@xyo-network/module-model'

import { WitnessReportEndEventData, WitnessReportStartEventData } from './Events'
import { WitnessModule } from './Module'

export interface WitnessModuleEventData<T extends WitnessModule = WitnessModule>
  extends WitnessReportEndEventData<T>,
    WitnessReportStartEventData<T>,
    ModuleEventData {}
