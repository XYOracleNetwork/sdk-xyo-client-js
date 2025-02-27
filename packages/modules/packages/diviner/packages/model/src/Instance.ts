import { ModuleInstance } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { DivinerQueryFunctions } from './DivinerQueryFunctions.ts'
import { DivinerModuleEventData } from './EventData.ts'
import { DivinerModule } from './Module.ts'
import { DivinerParams } from './Params.ts'

export interface DivinerInstance<
  TParams extends DivinerParams = DivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEvents extends DivinerModuleEventData = DivinerModuleEventData,
> extends DivinerModule<TParams, TEvents>,
  DivinerQueryFunctions<TIn, TOut>,
  ModuleInstance<TParams, TEvents> {}
