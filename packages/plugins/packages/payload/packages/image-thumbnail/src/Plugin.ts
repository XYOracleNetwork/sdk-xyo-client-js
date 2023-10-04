import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { ImageThumbnail } from './Payload/ImageThumbnail'
import { ImageThumbnailSchema } from './Schema'

export const ImageThumbnailPayloadPlugin = () =>
  createPayloadPlugin<ImageThumbnail>({
    schema: ImageThumbnailSchema,
  })
