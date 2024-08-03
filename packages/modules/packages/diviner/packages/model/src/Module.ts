import { Module } from '@xyo-network/module-model'

import { DivinerModuleEventData } from './EventData.ts'
import { DivinerParams } from './Params.ts'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DivinerModule<TParams extends DivinerParams = DivinerParams, TEvents extends DivinerModuleEventData = DivinerModuleEventData>
  extends Module<TParams, TEvents> {}
