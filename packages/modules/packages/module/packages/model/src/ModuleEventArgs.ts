import { EventArgs } from '@xyo-network/module-events'

import { Module } from './Module'

export type ModuleEventArgs<TArgs extends EventArgs | undefined = undefined> = TArgs extends EventArgs
  ? {
      module: Module
    } & TArgs
  : {
      module: Module
    }
