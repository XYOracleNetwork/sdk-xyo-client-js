import { asSchema } from '@xyo-network/payload-model'

export const ConfigSchema = asSchema('network.xyo.config', true)
export type ConfigSchema = typeof ConfigSchema
