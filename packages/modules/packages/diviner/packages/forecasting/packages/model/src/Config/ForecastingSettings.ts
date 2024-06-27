import { Address } from '@xylabs/hex'
import { Schema } from '@xyo-network/payload-model'

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
