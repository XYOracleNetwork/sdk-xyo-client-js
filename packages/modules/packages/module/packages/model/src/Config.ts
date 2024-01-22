import { Address } from '@xylabs/hex'
import { EmptyObject, WithAdditional } from '@xylabs/object'
import { RetryConfig } from '@xylabs/retry'
import { Payload, Schema } from '@xyo-network/payload-model'

import { Labels } from './Labels'

export type ModuleConfigSchema = 'network.xyo.module.config'
export const ModuleConfigSchema: ModuleConfigSchema = 'network.xyo.module.config'

export type CosigningAddressSet = string[]
export type SchemaString = string
export type ModuleName = string
export type NameOrAddress = Address | ModuleName

export interface ArchivingModuleConfig {
  readonly archiving?: {
    readonly archivists?: NameOrAddress[]
  }
}

export type ModuleConfig<TConfig extends EmptyObject | Payload | void = void, TSchema extends Schema | void = void> = Payload<
  WithAdditional<
    {
      /** @field The name/address of the Archivist to use for this module */
      readonly archivist?: NameOrAddress

      /**
       * @field The labels used for this module. If a label is specified, then the
       * ModuleFactoryLocator will attempt to find a ModuleFactory with the corresponding
       * labels to construct this module.
       */
      readonly labels?: Labels

      /** @field Friendly name of module (not collision resistent). Can be used to resolve module when registered/attached to Node. */
      readonly name?: string

      /** @field paging settings for queries */
      readonly paging?: Record<string, { size?: number }>

      readonly retry?: RetryConfig

      schema: TConfig extends Payload ? TConfig['schema'] : ModuleConfigSchema

      /** @field The query schemas and allowed/disallowed addresses which are allowed to issue them against the module. If both allowed and disallowed is specified, then disallowed takes priority. */
      readonly security?: {
        /** @field Will the module process queries that have unsigned BoundWitness in query tuples */
        readonly allowAnonymous?: boolean

        /** @field If schema in record, then only these address sets can access query */
        readonly allowed?: Record<SchemaString, (Address | CosigningAddressSet)[]>

        /** @field If schema in record, then anyone except these addresses can access query */
        readonly disallowed?: Record<SchemaString, Address[]>
      }

      /** @field sign every query */
      readonly sign?: boolean

      /** @field Store the queries made to the module in an archivist if possible */
      readonly storeQueries?: boolean

      /** @field add a timestamp payload to every query  */
      readonly timestamp?: boolean
    } & ArchivingModuleConfig,
    TConfig
  >,
  TSchema
>

export type AnyConfigSchema<TConfig extends Omit<ModuleConfig, 'schema'> & { schema: string } = Omit<ModuleConfig, 'schema'> & { schema: string }> =
  ModuleConfig<TConfig, string>

export type OptionalConfigSchema<TConfig extends AnyConfigSchema<ModuleConfig> = AnyConfigSchema<ModuleConfig>> = Omit<TConfig, 'schema'> & {
  schema?: TConfig['schema']
}

export type AnyModuleConfig = AnyConfigSchema<ModuleConfig>
