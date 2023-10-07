import { UrlSchema } from '@xyo-network/url-payload-plugin'
import { WitnessConfig } from '@xyo-network/witness-model'

export const UrlWitnessConfigSchema = `${UrlSchema}.witness.config` as const
export type UrlWitnessConfigSchema = typeof UrlWitnessConfigSchema

export type UrlWitnessConfig = WitnessConfig<{
  schema: UrlWitnessConfigSchema
  urls?: string[]
}>
