import { AnyObject } from '@xyo-network/core'
import { XyoPayload } from '@xyo-network/payload-model'

export type ModuleConfigSchema = 'network.xyo.module.config'
export const ModuleConfigSchema: ModuleConfigSchema = 'network.xyo.module.config'

export type AddressString = string
export type CosigningAddressSet = string[]
export type SchemaString = string

export type ModuleConfigBase<T extends AnyObject = AnyObject> = XyoPayload<
  {
    //friendly name of module (not collision resistent)
    name?: string

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
  } & T
>

export type ModuleConfig<TConfig extends AnyObject = AnyObject> = ModuleConfigBase<TConfig>
