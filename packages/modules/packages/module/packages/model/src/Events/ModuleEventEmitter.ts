import { AnyObject } from '@xyo-network/core'
import Emittery from 'emittery'

import { Module } from '../model'
import { EventArgs } from './EventArgs'

export type EventName = PropertyKey

export type ModuleEventArgs<TArgs extends AnyObject | undefined = undefined> = TArgs extends AnyObject
  ? EventArgs<
      {
        module: Module
      } & TArgs
    >
  : EventArgs<{
      module: Module
    }>

export interface ModuleEventEmitter<
  TEmitterEventData extends Record<EventName, ModuleEventArgs> = Record<EventName, ModuleEventArgs>,
  TEmitter extends Emittery<TEmitterEventData> = Emittery<TEmitterEventData>,
> {
  emit: TEmitter['emit']
  events?: keyof TEmitterEventData
  off: TEmitter['off']
  on: TEmitter['on']
  once: TEmitter['once']
}
