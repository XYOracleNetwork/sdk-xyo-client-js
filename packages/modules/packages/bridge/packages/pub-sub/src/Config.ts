import { EmptyObject } from '@xylabs/object'
import { BridgeConfig } from '@xyo-network/bridge-model'

import { PubSubBridgeSchema } from './Schema'

export const PubSubBridgeConfigSchema = `${PubSubBridgeSchema}.config`
export type PubSubBridgeConfigSchema = typeof PubSubBridgeConfigSchema

/**
 * Configuration for the mutually accessible
 * modules between the modules being connected
 */
export interface IntermediaryConfig {
  /**
   * Name/Address of the archivist where intermediate communications are stored
   */
  archivist: string
  /**
   * Name/Address of the diviner where intermediate communications are filtered
   */
  boundWitnessDiviner: string
  // TODO: Is it required to have a bridge module (that we "wrap"). Having it per intermediary
  // allows for more flexibility, but it also means that we have to have additional configuration
  // for the nominal case (single intermediary)
  // /**
  //  * The name/address of the bridge module used to communicate with the intermediary
  //  */
  bridge?: string
}

/**
 * Configuration for the PubSubBridge
 */
export type PubSubBridgeConfig<TConfig extends EmptyObject = EmptyObject, TSchema extends string | void = void> = BridgeConfig<
  {
    /**
     * Configuration for intermediary query storage
     */
    queries?: IntermediaryConfig
    /**
     * Configuration for intermediary response storage
     */
    responses?: IntermediaryConfig
    /**
     * The configurations schema for the module
     */
    schema: PubSubBridgeConfigSchema
  } & TConfig,
  TSchema extends string ? TSchema : PubSubBridgeConfigSchema
>
