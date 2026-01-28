import { asSchema } from '@xyo-network/payload-model'

export const EnvironmentSchema = asSchema('network.xyo.environment', true)
export type EnvironmentSchema = typeof EnvironmentSchema
