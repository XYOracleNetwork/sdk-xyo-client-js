import { WithAdditional } from '@xyo-network/core'
import { Payload } from '@xyo-network/payload-model'

export type ModuleConfigSchema = 'network.xyo.module.config'
export const ModuleConfigSchema: ModuleConfigSchema = 'network.xyo.module.config'

export type AddressString = string
export type CosigningAddressSet = string[]
export type SchemaString = string

export type NameOrAddress = string

export interface IndividualArchivistConfig {
  readonly commit?: NameOrAddress
  readonly read?: NameOrAddress
  readonly write?: NameOrAddress
}

export type ArchivistModuleConfig = NameOrAddress | IndividualArchivistConfig

export type ModuleConfigBase<TConfig extends Payload | undefined = undefined> = Payload<
  WithAdditional<
    {
      /**
       * The name/address of the Archivist to use for this module
       */
      readonly archivist?: ArchivistModuleConfig

      /**
       * Friendly name of module (not collision resistent). Can be used to resolve module
       * when registered/attached to Node.
       */
      readonly name?: string

      /**
       * paging settings for queries
       */
      readonly paging?: Record<string, { size?: number }>

      /**
       * The config schema for the module
       */
      readonly schema: TConfig extends Payload ? TConfig['schema'] : ModuleConfigSchema

      /**
       * The query schemas and allowed/disallowed addresses which are allowed to issue them
       * against the module. If both allowed and disallowed is specified, then disallowed
       * takes priority
       */
      readonly security?: {
        /**
         * Will the module process queries that have unsigned BoundWitness in query tuples
         */
        readonly allowAnonymous?: boolean

        /**
         * If schema in record, then only these address sets can access query
         */
        readonly allowed?: Record<SchemaString, (AddressString | CosigningAddressSet)[]>

        /**
         * If schema in record, then anyone except these addresses can access query
         */
        readonly disallowed?: Record<SchemaString, AddressString[]>
      }

      /**
       * Store the queries made to the module in an archivist if possible
       */
      readonly storeQueries?: boolean
    },
    Omit<TConfig, 'schema'>
  >
>

export type ModuleConfig<TConfig extends Payload | undefined = undefined> = ModuleConfigBase<TConfig>

export type AnyConfigSchema<TConfig extends Omit<ModuleConfig, 'schema'> & { schema: string } = Omit<ModuleConfig, 'schema'> & { schema: string }> =
  ModuleConfig<
    WithAdditional<
      Omit<TConfig, 'schema'>,
      {
        schema: string
      }
    >
  >

export type OptionalConfigSchema<TConfig extends AnyConfigSchema<ModuleConfig> = AnyConfigSchema<ModuleConfig>> = Omit<TConfig, 'schema'> & {
  schema?: TConfig['schema']
}

export type AnyModuleConfig = AnyConfigSchema<ModuleConfig>
