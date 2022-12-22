import { AbstractDiviner, DivinerConfig } from '@xyo-network/diviner'
import { XyoQuery } from '@xyo-network/module-model'
import { XyoPayload } from '@xyo-network/payload-model'

export type ModuleAddressSchema = 'network.xyo.module.address'
export const ModuleAddressSchema: ModuleAddressSchema = 'network.xyo.module.address'

export type ModuleAddressDivinerConfigSchema = 'network.xyo.module.address.config'
export const ModuleAddressDivinerConfigSchema: ModuleAddressDivinerConfigSchema = 'network.xyo.module.address.config'

export type ModuleAddressDivinerConfig<S extends string = string, T extends XyoPayload = XyoPayload> = DivinerConfig<
  T & {
    schema: S
  }
>

export type ModuleAddressQuerySchema = 'network.xyo.module.address.query'
export const ModuleAddressQuerySchema: ModuleAddressQuerySchema = 'network.xyo.module.address.query'

export type ModuleAddressPayload = XyoPayload<{ schema: ModuleAddressSchema }>
export const isModuleAddressPayload = (x?: XyoPayload | null): x is ModuleAddressPayload => x?.schema === ModuleAddressSchema

export type ModuleAddressQueryPayload = XyoQuery<{ schema: ModuleAddressQuerySchema }>
export const isModuleAddressQueryPayload = (x?: XyoPayload | null): x is ModuleAddressQueryPayload => x?.schema === ModuleAddressQuerySchema

export type ModuleAddressDiviner = AbstractDiviner
