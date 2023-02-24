import { AnyObject } from '@xyo-network/core'
import { Module, XyoQueryBoundWitness } from '@xyo-network/module-model'
import { XyoPayload } from '@xyo-network/payload-model'

import { EventArgs } from './EventArgs'
import { ModuleEventEmitter } from './ModuleEventEmitter'

export type ModuleQueriedEvent = 'moduleQueried'
export const ModuleQueriedEvent: ModuleQueriedEvent = 'moduleQueried'

export type ModuleEventArgs<TArgs extends AnyObject | undefined = undefined> = TArgs extends AnyObject
  ? EventArgs<
      {
        module: Module
      } & TArgs
    >
  : EventArgs<{
      module: Module
    }>

export type ModuleQueriedEventArgs = ModuleEventArgs<{
  payloads?: XyoPayload[]
  query: XyoQueryBoundWitness
}>

export type ModuleQueriedEventEmitter = ModuleEventEmitter<ModuleQueriedEvent, ModuleQueriedEventArgs>
