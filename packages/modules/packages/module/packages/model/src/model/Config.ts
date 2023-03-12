import { XyoPayload } from '@xyo-network/payload-model'

import { WithAdditional } from './ModuleParams'

export type ModuleConfigSchema = 'network.xyo.module.config'
export const ModuleConfigSchema: ModuleConfigSchema = 'network.xyo.module.config'

export type AddressString = string
export type CosigningAddressSet = string[]
export type SchemaString = string

export type ModuleConfigBase<TConfig extends XyoPayload | undefined = undefined> = XyoPayload<
  WithAdditional<
    {
      //friendly name of module (not collision resistent)
      name?: string

      schema: TConfig extends XyoPayload ? TConfig['schema'] : ModuleConfigSchema

      //if both allowed and disallowed is specified, then disallowed takes priority
      security?: {
        //will process queries that have unsigned boundwitness in tuples
        allowAnonymous?: boolean

        //if schema in record, then only these address sets can access query
        allowed?: Record<SchemaString, (AddressString | CosigningAddressSet)[]>

        //if schema in record, then anyone except these addresses can access query
        disallowed?: Record<SchemaString, AddressString[]>
      }

      //store the queries made to the module in an archivist if possible
      storeQueries?: boolean
    },
    Omit<TConfig, 'schema'>
  >
>

export type ModuleConfig<TConfig extends XyoPayload | undefined = undefined> = ModuleConfigBase<TConfig>
