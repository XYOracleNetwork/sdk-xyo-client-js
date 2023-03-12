import { EventArgs } from './Events'
import { Module } from './Module'

export type ModuleEventArgs<TArgs extends EventArgs | undefined = undefined> = TArgs extends EventArgs
  ? {
      module: Module
    } & TArgs
  : {
      module: Module
    }
