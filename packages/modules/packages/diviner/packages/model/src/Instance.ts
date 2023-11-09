import { ModuleInstance } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { DivinerQueryFunctions } from './DivinerQueryFunctions'
import { DivinerModuleEventData } from './EventData'
import { CustomDivinerModule, DivinerModule } from './Module'
import { DivinerParams } from './Params'

export type DivinerInstance<
  TParams extends DivinerParams = DivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
> = DivinerModule<TParams, TIn, TOut> & DivinerQueryFunctions & ModuleInstance

export type CustomDivinerInstance<
  TParams extends DivinerParams = DivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEvents extends DivinerModuleEventData<DivinerInstance<TParams, TIn, TOut>, TIn, TOut> = DivinerModuleEventData<
    DivinerInstance<TParams, TIn, TOut>,
    TIn,
    TOut
  >,
> = CustomDivinerModule<TParams, TIn, TOut, TEvents> & DivinerQueryFunctions & ModuleInstance

/** @deprecated use DivinerInstance instead */
export type Diviner = DivinerInstance
