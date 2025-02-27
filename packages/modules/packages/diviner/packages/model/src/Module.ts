import { Module } from '@xyo-network/module-model'

import { DivinerModuleEventData } from './EventData.ts'
import { DivinerParams } from './Params.ts'

export interface DivinerModule<TParams extends DivinerParams = DivinerParams, TEvents extends DivinerModuleEventData = DivinerModuleEventData>
  extends Module<TParams, TEvents> {}
