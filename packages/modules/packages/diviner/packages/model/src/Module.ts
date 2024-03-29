import { Module } from '@xyo-network/module-model'

import { DivinerModuleEventData } from './EventData'
import { DivinerParams } from './Params'

export interface DivinerModule<TParams extends DivinerParams = DivinerParams, TEvents extends DivinerModuleEventData = DivinerModuleEventData>
  extends Module<TParams, TEvents> {}
