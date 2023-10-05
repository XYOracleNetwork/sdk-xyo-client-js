import { Payload } from '@xyo-network/payload-model'
import { UrlPayload } from '@xyo-network/url-payload-plugin'

import { ImageThumbnailDivinerSchema } from './Schema'

export type ImageThumbnailDivinerQuerySchema = `${ImageThumbnailDivinerSchema}.query`
export const ImageThumbnailDivinerQuerySchema: ImageThumbnailDivinerQuerySchema = `${ImageThumbnailDivinerSchema}.query`

export type ImageThumbnailDivinerQueryPayload = UrlPayload &
  Payload<
    {
      foo: string
    },
    ImageThumbnailDivinerQuerySchema
  >
