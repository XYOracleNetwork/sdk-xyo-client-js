import type { Address } from '@xylabs/hex'
import type { Schema } from '@xyo-network/payload-model'

export interface ForecastingSettings {
  batchLimit?: number
  forecastingMethod?: string
  forecastingSteps?: number
  maxTrainingLength?: number
  timestamp?: number
  windowSize?: number
  witnessAddresses?: Address[]
  witnessSchema?: Schema
}
