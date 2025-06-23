import type { Module } from '@xyo-network/module-model'

import type { DivinerModuleEventData } from './EventData.ts'
import type { DivinerParams } from './Params.ts'

export type DivinerModule<TParams extends DivinerParams = DivinerParams, TEvents extends DivinerModuleEventData = DivinerModuleEventData>
  = Module<TParams, TEvents>
