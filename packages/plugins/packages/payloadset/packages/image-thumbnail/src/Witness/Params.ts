import { AnyConfigSchema } from '@xyo-network/module-model'
import { WitnessParams } from '@xyo-network/witness-model'

import { ImageThumbnailWitnessConfig } from './Config'

export type ImageThumbnailWitnessParams = WitnessParams<
  AnyConfigSchema<ImageThumbnailWitnessConfig>,
  {
    loaders?: string[]
  }
>
