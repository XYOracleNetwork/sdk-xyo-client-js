import type { Module } from '@xyo-network/module-model'

import type { DivinerModuleEventData } from './EventData.ts'
import type { DivinerParams } from './Params.ts'

export interface DivinerModule<TParams extends DivinerParams = DivinerParams, TEvents extends DivinerModuleEventData = DivinerModuleEventData>
  extends Module<TParams, TEvents> {}
