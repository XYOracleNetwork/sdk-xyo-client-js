import { ModuleInstance } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { DivinerQueryFunctions } from './DivinerQueryFunctions.js'
import { DivinerModuleEventData } from './EventData.js'
import { DivinerModule } from './Module.js'
import { DivinerParams } from './Params.js'

export interface DivinerInstance<
  TParams extends DivinerParams = DivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEvents extends DivinerModuleEventData = DivinerModuleEventData,
> extends DivinerModule<TParams, TEvents>,
    DivinerQueryFunctions<TIn, TOut>,
    ModuleInstance<TParams, TEvents> {}
