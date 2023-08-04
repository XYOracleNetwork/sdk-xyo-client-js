import { AnyConfigSchema } from '@xyo-network/module'
import { WitnessParams } from '@xyo-network/witness'

import { ImageThumbnailWitnessConfig } from './Config'

export type ImageThumbnailWitnessParams = WitnessParams<
  AnyConfigSchema<ImageThumbnailWitnessConfig>,
  {
    loaders?: string[]
  }
>
