import { ModuleInstance } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { DivinerQueryFunctions } from './DivinerQueryFunctions'
import { DivinerModuleEventData } from './EventData'
import { DivinerModule } from './Module'
import { DivinerParams } from './Params'

export interface DivinerInstance<
  TParams extends DivinerParams = DivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEvents extends DivinerModuleEventData = DivinerModuleEventData,
> extends DivinerModule<TParams, TEvents>,
    DivinerQueryFunctions<TIn, TOut>,
    ModuleInstance<TParams, TEvents> {}
