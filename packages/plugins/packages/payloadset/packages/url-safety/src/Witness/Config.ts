import { UrlSafetySchema } from '@xyo-network/url-safety-payload-plugin'
import { WitnessConfig } from '@xyo-network/witness'

export const UrlSafetyWitnessConfigSchema = `${UrlSafetySchema}.witness.config` as const
export type UrlSafetyWitnessConfigSchema = typeof UrlSafetyWitnessConfigSchema

export type UrlSafetyWitnessConfig = WitnessConfig<{
  google?: {
    safeBrowsing?: {
      endPoint?: string
    }
  }
  schema: UrlSafetyWitnessConfigSchema
  urls?: string[]
}>
