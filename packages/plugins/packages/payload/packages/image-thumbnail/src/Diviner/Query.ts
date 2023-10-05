import { PayloadDivinerPredicate } from '@xyo-network/diviner-payload-model'
import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

import { ImageThumbnailDivinerSchema } from './Schema'

export type ImageThumbnailDivinerQuerySchema = `${ImageThumbnailDivinerSchema}.query`
export const ImageThumbnailDivinerQuerySchema: ImageThumbnailDivinerQuerySchema = `${ImageThumbnailDivinerSchema}.query`

export type ImageThumbnailDivinerQuery = Pick<PayloadDivinerPredicate, 'limit' | 'offset' | 'order'> &
  Payload<{ status?: number; success?: boolean; url: string }, ImageThumbnailDivinerQuerySchema>

export const isImageThumbnailDivinerQuery = isPayloadOfSchemaType<ImageThumbnailDivinerQuery>(ImageThumbnailDivinerQuerySchema)
