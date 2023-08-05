import { AnyConfigSchema } from '@xyo-network/module'
import { WitnessParams } from '@xyo-network/witness'

import { UrlSafetyWitnessConfig } from './Config'

export type UrlSafetyWitnessParams = WitnessParams<
  AnyConfigSchema<UrlSafetyWitnessConfig>,
  {
    google?: {
      safeBrowsing?: {
        endPoint?: string
        key?: string
      }
    }
  }
>
