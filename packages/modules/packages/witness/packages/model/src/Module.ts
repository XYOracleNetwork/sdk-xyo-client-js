import { Module, ModuleEventData } from '@xyo-network/module-model'

import { WitnessReportEndEventData, WitnessReportStartEventData } from './Events'
import { WitnessParams } from './Params'
import { Witness } from './Witness'

export interface WitnessModuleEventData extends WitnessReportEndEventData, WitnessReportStartEventData, ModuleEventData {}

export type WitnessModule<
  TParams extends WitnessParams = WitnessParams,
  TEventData extends WitnessModuleEventData = WitnessModuleEventData,
> = Witness & Module<TParams, TEventData>