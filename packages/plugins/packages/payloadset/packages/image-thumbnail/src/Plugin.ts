import { ImageThumbnailSchema } from '@xyo-network/image-thumbnail-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetDualPlugin } from '@xyo-network/payloadset-plugin'

import { ImageThumbnailDiviner } from './Diviner'
import { ImageThumbnailWitness } from './Witness'

export const ImageThumbnailPlugin = () =>
  createPayloadSetDualPlugin<ImageThumbnailWitness, ImageThumbnailDiviner>(
    { required: { [ImageThumbnailSchema]: 1 }, schema: PayloadSetSchema },
    {
      diviner: async (params) => {
        const result = await ImageThumbnailDiviner.create(params)
        return result
      },
      witness: async (params) => {
        const result = await ImageThumbnailWitness.create(params)
        return result
      },
    },
  )
