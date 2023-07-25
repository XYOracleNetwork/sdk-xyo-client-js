import { AnyConfigSchema, ModuleConfig } from '../Config'
import { Module, ModuleEventData, ModuleQueryFunctions } from '../module'
import { ModuleParams } from '../ModuleParams'

export type ModuleInstance<
  TParams extends ModuleParams<AnyConfigSchema<ModuleConfig>> = ModuleParams<AnyConfigSchema<ModuleConfig>>,
  TEventData extends ModuleEventData = ModuleEventData,
> = Module<TParams, TEventData> & ModuleQueryFunctions
