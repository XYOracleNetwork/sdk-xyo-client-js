import { BaseParams } from '@xylabs/object'
import { ArchivistInstance } from '@xyo-network/archivist-model'
import { BridgeParams } from '@xyo-network/bridge-model'
import { DivinerInstance } from '@xyo-network/diviner-model'
import { AnyConfigSchema, ModuleInstance } from '@xyo-network/module-model'

import { AsyncQueryBusConfig, PubSubBridgeConfig } from './Config'

/**
 * The parameters for the PubSubBridge
 */
export type PubSubBridgeParams<TConfig extends AnyConfigSchema<PubSubBridgeConfig> = AnyConfigSchema<PubSubBridgeConfig>> = BridgeParams<TConfig>

export type AsyncQueryBusParams = BaseParams<
  {
    config: Omit<AsyncQueryBusConfig<ArchivistInstance, DivinerInstance>, 'responses' | 'queries' | 'schema'>
    listeningModules: () => Promise<ModuleInstance[]>
  } & Required<Pick<AsyncQueryBusConfig<ArchivistInstance, DivinerInstance>, 'responses' | 'queries'>>
>
