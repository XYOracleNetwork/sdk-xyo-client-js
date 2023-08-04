import { ImageThumbnailSchema } from '@xyo-network/image-thumbnail-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { ImageThumbnailWitness } from './Witness'

export const ImageThumbnailPlugin = () =>
  createPayloadSetWitnessPlugin<ImageThumbnailWitness>(
    { required: { [ImageThumbnailSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await ImageThumbnailWitness.create(params)
        return result
      },
    },
  )
