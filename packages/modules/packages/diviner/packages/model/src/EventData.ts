import { ModuleEventData, ModuleInstance } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { DivineEndEventData, DivineStartEventData } from './EventsModels/index.js'

export type DivinerModuleEventData<
  TInstance extends ModuleInstance = ModuleInstance,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
> = DivineEndEventData<TInstance, TIn, TOut> & DivineStartEventData<TInstance, TIn> & ModuleEventData<TInstance>
