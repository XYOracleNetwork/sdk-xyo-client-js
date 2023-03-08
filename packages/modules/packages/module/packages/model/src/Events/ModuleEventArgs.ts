import { AnyObject } from '@xyo-network/core'

import { Module } from '../model'
import { EventArgs } from './EventArgs'

export type ModuleEventArgs<TArgs extends AnyObject | undefined = undefined> = TArgs extends AnyObject
  ? EventArgs<
      {
        module: Module
      } & TArgs
    >
  : EventArgs<{
      module: Module
    }>
