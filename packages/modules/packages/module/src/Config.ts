import { EmptyObject } from '@xyo-network/core'
import { XyoPayload } from '@xyo-network/payload'

export type XyoModuleConfigSchema = 'network.xyo.module.config'
export const XyoModuleConfigSchema: XyoModuleConfigSchema = 'network.xyo.module.config'

export type AddressString = string
export type SchemaString = string

export type XyoModuleConfigBase<T extends EmptyObject = EmptyObject> = XyoPayload<
  {
    // the archivists that every query result is stored to
    // it is required for these to be resolvable by the resolver
    archivists?: string[]

    //if both allowed and disallowed is specified, then disallowed takes priority
    security?: {
      //if schema in record, then only these address sets can access query
      allowed?: Record<SchemaString, AddressString[][]>
      //if schema in record, then anyone except these addresses can access query
      disallowed?: Record<SchemaString, AddressString[]>
    }
  } & T
>

export type XyoModuleConfig<TConfig extends XyoPayload = XyoPayload> = XyoModuleConfigBase<TConfig>
