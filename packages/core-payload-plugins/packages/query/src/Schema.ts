import { asSchema } from '@xyo-network/payload-model'

export const QuerySchema = asSchema('network.xyo.query', true)
export type QuerySchema = typeof QuerySchema
