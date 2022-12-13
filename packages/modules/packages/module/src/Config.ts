import { EmptyObject } from '@xyo-network/core'
import { XyoPayload } from '@xyo-network/payload'

export type AbstractModuleConfigSchema = 'network.xyo.module.config'
export const AbstractModuleConfigSchema: AbstractModuleConfigSchema = 'network.xyo.module.config'

export type AddressString = string
export type SchemaString = string

export type AbstractModuleConfigBase<T extends EmptyObject = EmptyObject> = XyoPayload<
  {
    //if both allowed and disallowed is specified, then disallowed takes priority
    security?: {
      //if schema in record, then only these address sets can access query
      allowed?: Record<SchemaString, AddressString[][]>
      //if schema in record, then anyone except these addresses can access query
      disallowed?: Record<SchemaString, AddressString[]>
    }
  } & T
>

export type AbstractModuleConfig<TConfig extends XyoPayload = XyoPayload> = AbstractModuleConfigBase<TConfig>
