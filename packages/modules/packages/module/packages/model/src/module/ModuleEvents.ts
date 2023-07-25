import { EventArgs } from '@xyo-network/module-events'

import { ModuleBusyEventData, ModuleErrorEventData, ModuleQueriedEventData } from '../Events'
import { Module } from './Module'

export type ModuleEventArgs<TModule extends Module = Module, TArgs extends EventArgs | undefined = undefined> = TArgs extends EventArgs
  ? {
      module: TModule
    } & TArgs
  : {
      module: TModule
    }

export interface ModuleEventData extends ModuleQueriedEventData, ModuleBusyEventData, ModuleErrorEventData {}
