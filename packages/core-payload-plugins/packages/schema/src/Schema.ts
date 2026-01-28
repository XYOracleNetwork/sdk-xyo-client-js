import { asSchema } from '@xyo-network/payload-model'

export const SchemaSchema = asSchema('network.xyo.schema', true)
export type SchemaSchema = typeof SchemaSchema
