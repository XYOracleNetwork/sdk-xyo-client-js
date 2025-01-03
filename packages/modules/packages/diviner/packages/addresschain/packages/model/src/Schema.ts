export const AddressChainSchema = 'network.xyo.diviner.address.chain' as const
export type AddressChainSchema = typeof AddressChainSchema

export const AddressChainDivinerConfigSchema = `${AddressChainSchema}.config` as const
export type AddressChainDivinerConfigSchema = typeof AddressChainDivinerConfigSchema

export const AddressChainQuerySchema = `${AddressChainSchema}.query` as const
export type AddressChainQuerySchema = typeof AddressChainQuerySchema
