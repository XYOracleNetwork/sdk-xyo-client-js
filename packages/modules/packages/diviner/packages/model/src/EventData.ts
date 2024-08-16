import type { ModuleEventData, ModuleInstance } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

import type { DivineEndEventData, DivineStartEventData } from './EventsModels/index.ts'

export type DivinerModuleEventData<
  TInstance extends ModuleInstance = ModuleInstance,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
> = DivineEndEventData<TInstance, TIn, TOut> & DivineStartEventData<TInstance, TIn> & ModuleEventData<TInstance>
