import type { ModuleInstance } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

import type { DivinerQueryFunctions } from './DivinerQueryFunctions.ts'
import type { DivinerModuleEventData } from './EventData.ts'
import type { DivinerModule } from './Module.ts'
import type { DivinerParams } from './Params.ts'

export type DivinerInstance<
  TParams extends DivinerParams = DivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEvents extends DivinerModuleEventData = DivinerModuleEventData,
> = DivinerModule<TParams, TEvents> &
  DivinerQueryFunctions<TIn, TOut> &
  ModuleInstance<TParams, TEvents>
