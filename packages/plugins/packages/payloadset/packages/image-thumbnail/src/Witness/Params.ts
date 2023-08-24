import { AnyConfigSchema } from '@xyo-network/module'
import { WitnessParams } from '@xyo-network/witness'

import { ImageThumbnailWitnessConfig } from './Config'

export type ImageThumbnailWitnessParams = WitnessParams<
  AnyConfigSchema<ImageThumbnailWitnessConfig>,
  {
    ipfs?: {
      infura?: {
        endpoint: string
        key: string
        secret: string
      }
    }
    loaders?: string[]
  }
>
