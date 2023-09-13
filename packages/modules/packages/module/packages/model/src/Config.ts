import { Address } from '@xyo-network/address-model'
import { WithAdditional } from '@xyo-network/core'
import { Payload, Schema } from '@xyo-network/payload-model'

export type ModuleConfigSchema = 'network.xyo.module.config'
export const ModuleConfigSchema: ModuleConfigSchema = 'network.xyo.module.config'

export type CosigningAddressSet = string[]

export type NameOrAddress = string | Address

export interface IndividualArchivistConfig {
  readonly commit?: NameOrAddress
  readonly read?: NameOrAddress
  readonly write?: NameOrAddress
}

export type ArchivistModuleConfig = NameOrAddress | IndividualArchivistConfig

export type ModuleConfigBase<TConfig extends Payload | undefined = undefined> = Payload<
  WithAdditional<
    {
      /** @field The path to use when creating the account */
      accountDerivationPath?: string

      /** @field The name/address of the Archivist to use for this module */
      readonly archivist?: ArchivistModuleConfig

      /** @field Friendly name of module (not collision resistent). Can be used to resolve module when registered/attached to Node. */
      readonly name?: string

      /** @field paging settings for queries */
      readonly paging?: Record<string, { size?: number }>

      /** @field The config schema for the module */
      readonly schema: TConfig extends Payload ? TConfig['schema'] : ModuleConfigSchema

      /** @field The query schemas and allowed/disallowed addresses which are allowed to issue them against the module. If both allowed and disallowed is specified, then disallowed takes priority. */
      readonly security?: {
        /** @field Will the module process queries that have unsigned BoundWitness in query tuples */
        readonly allowAnonymous?: boolean

        /** @field If schema in record, then only these address sets can access query */
        readonly allowed?: Record<Schema, (Address | CosigningAddressSet)[]>

        /** @field If schema in record, then anyone except these addresses can access query */
        readonly disallowed?: Record<Schema, Address[]>
      }

      /** @field sign every query */
      readonly sign?: boolean

      /** @field Store the queries made to the module in an archivist if possible */
      readonly storeQueries?: boolean

      /** @field add a timestamp payload to every query  */
      readonly timestamp?: boolean
    },
    Omit<TConfig, 'schema'>
  >
>

export type ModuleConfig<TConfig extends Payload | undefined = undefined> = ModuleConfigBase<TConfig>

export type AnyConfigSchema<TConfig extends Omit<ModuleConfig, 'schema'> & { schema: Schema } = Omit<ModuleConfig, 'schema'> & { schema: Schema }> =
  ModuleConfig<
    WithAdditional<
      Omit<TConfig, 'schema'>,
      {
        schema: Schema
      }
    >
  >

export type OptionalConfigSchema<TConfig extends AnyConfigSchema<ModuleConfig> = AnyConfigSchema<ModuleConfig>> = Omit<TConfig, 'schema'> & {
  schema?: TConfig['schema']
}

export type AnyModuleConfig = AnyConfigSchema<ModuleConfig>
