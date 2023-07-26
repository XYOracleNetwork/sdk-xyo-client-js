import { ModuleInstance } from '@xyo-network/module-model'

import { WitnessModuleEventData } from './EventData'
import { CustomWitnessModule, WitnessModule } from './Module'
import { WitnessParams } from './Params'
import { Witness } from './Witness'

export type WitnessInstance<TParams extends WitnessParams = WitnessParams> = WitnessModule<TParams> & Witness & ModuleInstance

export type CustomWitnessInstance<
  TParams extends WitnessParams = WitnessParams,
  TEvents extends WitnessModuleEventData<WitnessInstance<TParams>> = WitnessModuleEventData<WitnessInstance<TParams>>,
> = CustomWitnessModule<TParams, TEvents> & Witness & ModuleInstance
