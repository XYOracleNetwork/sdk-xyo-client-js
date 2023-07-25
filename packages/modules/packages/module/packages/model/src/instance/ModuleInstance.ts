import { AnyConfigSchema, ModuleConfig } from '../Config'
import { ModuleEventData } from '../Events'
import { Module, ModuleQueryFunctions } from '../module'
import { ModuleParams } from '../ModuleParams'
import { ModuleResolver } from './ModuleResolver'
import { ResolveFunctions } from './ResolveFunctions'

export type ModuleInstance<
  TParams extends ModuleParams<AnyConfigSchema<ModuleConfig>> = ModuleParams<AnyConfigSchema<ModuleConfig>>,
  TEventData extends ModuleEventData = ModuleEventData,
> = Module<TParams, TEventData> &
  ResolveFunctions &
  ModuleQueryFunctions & {
    /* The resolver is a 'down' resolver.  It can resolve the module or any children (if it is a node for example), that are in the module*/
    readonly downResolver: Omit<ModuleResolver, 'resolve'>

    /* The resolver is a 'up' resolver.  It can resolve the parent or any children of the parent*/
    /* This is set by a NodeModule when attaching to the module */
    readonly upResolver: Omit<ModuleResolver, 'resolve'>
  }
