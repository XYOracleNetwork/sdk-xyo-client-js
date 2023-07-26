import { Module, ModuleEventData } from '@xyo-network/module-model'

import { WitnessReportEndEventData, WitnessReportStartEventData } from './Events'

export interface WitnessModuleEventData<T extends Module = Module>
  extends WitnessReportEndEventData<T>,
    WitnessReportStartEventData<T>,
    ModuleEventData {}
