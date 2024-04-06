import { AnyConfigSchema, Module } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { WitnessConfig } from './Config'
import { WitnessModuleEventData } from './EventData'
import { WitnessInstance } from './Instance'

export type CustomWitnessModule<
  TConfig extends AnyConfigSchema<WitnessConfig> = AnyConfigSchema<WitnessConfig>,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEvents extends WitnessModuleEventData<WitnessInstance<TConfig, TIn, TOut>, TIn, TOut> = WitnessModuleEventData<
    WitnessInstance<TConfig, TIn, TOut>,
    TIn,
    TOut
  >,
> = Module<TConfig, TEvents>
