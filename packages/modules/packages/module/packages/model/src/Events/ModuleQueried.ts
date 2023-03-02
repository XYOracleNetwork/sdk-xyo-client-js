import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { AnyObject } from '@xyo-network/core'
import { XyoPayload } from '@xyo-network/payload-model'

import { Module } from '../model'
import { XyoQueryBoundWitness } from '../Query'
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
  result: [XyoBoundWitness, XyoPayload[]]
}>

export type ModuleQueriedEventEmitter = ModuleEventEmitter<ModuleQueriedEvent, ModuleQueriedEventArgs>
