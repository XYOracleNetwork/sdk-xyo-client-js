import { asSchema } from '@xyo-network/payload-model'

export const AddressChainSchema = 'network.xyo.diviner.address.chain' as const
export type AddressChainSchema = typeof AddressChainSchema

export const AddressChainDivinerConfigSchema = asSchema(`${AddressChainSchema}.config`, true)
export type AddressChainDivinerConfigSchema = typeof AddressChainDivinerConfigSchema

export const AddressChainQuerySchema = asSchema(`${AddressChainSchema}.query`, true)
export type AddressChainQuerySchema = typeof AddressChainQuerySchema
