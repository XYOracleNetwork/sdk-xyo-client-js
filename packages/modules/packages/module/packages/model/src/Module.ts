import { AccountInstance } from '@xyo-network/account-model'
import { QueryBoundWitness } from '@xyo-network/boundwitness-builder'
import { ModuleManifestPayload } from '@xyo-network/manifest-model'
import { EventArgs, EventFunctions } from '@xyo-network/module-events'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { AnyConfigSchema, ModuleConfig } from './Config'
import { ModuleBusyEventData, ModuleQueriedEventData } from './Events'
import { ModuleDescription } from './ModuleDescription'
import { ModuleFilter } from './ModuleFilter'
import { ModuleParams } from './ModuleParams'
import { ModuleQueryResult } from './ModuleQueryResult'
import { AddressPreviousHashPayload } from './Queries'

export interface ResolveFunctions {
  resolve<TModule extends Module = Module>(filter?: ModuleFilter): Promisable<TModule[]>
  resolve<TModule extends Module = Module>(nameOrAddress: string): Promisable<TModule | undefined>
  resolve<TModule extends Module = Module>(nameOrAddressOrFilter?: ModuleFilter | string): Promisable<TModule | TModule[] | undefined>
}

export interface ModuleResolver extends ResolveFunctions {
  addResolver: (resolver: ModuleResolver) => this
  isModuleResolver: boolean
  removeResolver: (resolver: ModuleResolver) => this
}

export type ModuleEventArgs<
  TModule extends IndirectModule = IndirectModule,
  TArgs extends EventArgs | undefined = undefined,
> = TArgs extends EventArgs
  ? {
      module: TModule
    } & TArgs
  : {
      module: TModule
    }

export interface ModuleEventData extends ModuleQueriedEventData, ModuleBusyEventData {}

export type ModuleQueryFunctions = {
  describe: () => Promise<ModuleDescription>
  discover: () => Promisable<Payload[]>
  manifest: () => Promisable<ModuleManifestPayload>
  moduleAddress: () => Promisable<AddressPreviousHashPayload[]>
}

export type ModuleFields<TParams extends ModuleParams<AnyConfigSchema<ModuleConfig>> = ModuleParams<AnyConfigSchema<ModuleConfig>>> = {
  address: string
  config: TParams['config']

  /* The resolver is a 'down' resolver.  It can resolve the module or any children (if it is a node for example), that are in the module*/
  readonly downResolver: ModuleResolver

  loadAccount?: () => Promisable<AccountInstance>

  params: TParams

  previousHash: () => Promisable<string | undefined>

  queries: string[]
  query: <T extends QueryBoundWitness = QueryBoundWitness, TConf extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConf,
  ) => Promisable<ModuleQueryResult>
  queryable: <T extends QueryBoundWitness = QueryBoundWitness, TConf extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConf,
  ) => Promisable<boolean>

  start?: () => Promisable<void>

  /* The resolver is a 'up' resolver.  It can resolve the parent or any children of the parent*/
  /* This is set by a NodeModule when attaching to the module */
  readonly upResolver: ModuleResolver
}

export type IndirectModule<
  TParams extends ModuleParams<AnyConfigSchema<ModuleConfig>> = ModuleParams<AnyConfigSchema<ModuleConfig>>,
  TEventData extends ModuleEventData = ModuleEventData,
> = ModuleFields<TParams> & EventFunctions<TEventData>

export type DirectModule<
  TParams extends ModuleParams<AnyConfigSchema<ModuleConfig>> = ModuleParams<AnyConfigSchema<ModuleConfig>>,
  TEventData extends ModuleEventData = ModuleEventData,
> = IndirectModule<TParams, TEventData> & ModuleQueryFunctions & ResolveFunctions

export type ModuleInstance<
  TParams extends ModuleParams<AnyConfigSchema<ModuleConfig>> = ModuleParams<AnyConfigSchema<ModuleConfig>>,
  TEventData extends ModuleEventData = ModuleEventData,
> = DirectModule<TParams, TEventData>

export type Module<
  TParams extends ModuleParams<AnyConfigSchema<ModuleConfig>> = ModuleParams<AnyConfigSchema<ModuleConfig>>,
  TEventData extends ModuleEventData = ModuleEventData,
> = IndirectModule<TParams, TEventData>
