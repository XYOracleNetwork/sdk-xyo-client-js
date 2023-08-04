import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { ImageThumbnailPayload } from './Payload'
import { ImageThumbnailSchema } from './Schema'

export const ImageThumbnailPayloadPlugin = () =>
  createPayloadPlugin<ImageThumbnailPayload>({
    schema: ImageThumbnailSchema,
  })
