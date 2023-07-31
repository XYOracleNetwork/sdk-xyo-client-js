import { ModuleInstance } from '@xyo-network/module-model'

import { DivinerQueryFunctions } from './DivinerQueryFunctions'
import { DivinerModuleEventData } from './EventData'
import { CustomDivinerModule, DivinerModule } from './Module'
import { DivinerParams } from './Params'

export type DivinerInstance<TParams extends DivinerParams = DivinerParams> = DivinerModule<TParams> & DivinerQueryFunctions & ModuleInstance

export type CustomDivinerInstance<
  TParams extends DivinerParams = DivinerParams,
  TEvents extends DivinerModuleEventData<DivinerInstance<TParams>> = DivinerModuleEventData<DivinerInstance<TParams>>,
> = CustomDivinerModule<TParams, TEvents> & DivinerQueryFunctions & ModuleInstance

/** @deprecated use DivinerInstance instead */
export type Diviner = DivinerInstance
