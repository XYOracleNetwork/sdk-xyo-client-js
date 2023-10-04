import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { ImageThumbnail } from './Payload'
import { ImageThumbnailSchema } from './Schema'

export const ImageThumbnailPayloadPlugin = () =>
  createPayloadPlugin<ImageThumbnail>({
    schema: ImageThumbnailSchema,
  })
