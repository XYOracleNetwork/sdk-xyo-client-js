import { asSchema } from '@xyo-network/payload-model'

export const DomainSchema = asSchema('network.xyo.domain', true)
export type DomainSchema = typeof DomainSchema
