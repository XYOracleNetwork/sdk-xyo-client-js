import { Address } from '@xylabs/hex'
import { Schema } from '@xyo-network/payload-model'

export interface ForecastingSettings {
  forecastingMethod?: string
  forecastingSteps?: number
  timestamp?: number
  windowSize?: number
  witnessAddresses?: Address[]
  witnessSchema?: Schema
}
