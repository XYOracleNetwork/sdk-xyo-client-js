import { Module } from '@xyo-network/module-model'

import { DivinerModuleEventData } from './EventData.js'
import { DivinerParams } from './Params.js'

export interface DivinerModule<TParams extends DivinerParams = DivinerParams, TEvents extends DivinerModuleEventData = DivinerModuleEventData>
  extends Module<TParams, TEvents> {}
