import { ModuleInstance } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { DivinerQueryFunctions } from './DivinerQueryFunctions'
import { DivinerModuleEventData } from './EventData'
import { CustomDivinerModule, DivinerModule } from './Module'
import { DivinerParams } from './Params'

export interface DivinerInstance<TParams extends DivinerParams = DivinerParams, TIn extends Payload = Payload, TOut extends Payload = Payload>
  extends DivinerModule<TParams, TIn, TOut>,
    DivinerQueryFunctions,
    ModuleInstance<TParams, DivinerModuleEventData<DivinerModule<TParams, TIn, TOut>>> {}

export interface CustomDivinerInstance<
  TParams extends DivinerParams = DivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEvents extends DivinerModuleEventData<DivinerInstance<TParams, TIn, TOut>, TIn, TOut> = DivinerModuleEventData<
    DivinerInstance<TParams, TIn, TOut>,
    TIn,
    TOut
  >,
> extends CustomDivinerModule<TParams, TIn, TOut, TEvents>,
    DivinerQueryFunctions,
    ModuleInstance<TParams, TEvents> {}

/** @deprecated use DivinerInstance instead */
export interface Diviner extends DivinerInstance {}
