import { PayloadDivinerQueryPayload } from '@xyo-network/diviner-payload-model'
import { ImageThumbnailResultIndex } from '@xyo-network/image-thumbnail-payload-plugin'

/**
 * The fields that will need to be indexed on in the underlying store
 */
export type QueryableImageThumbnailResultProperties = Extract<keyof ImageThumbnailResultIndex, 'status' | 'success' | 'timestamp' | 'key'>

/**
 * The query that will be used to retrieve the results from the underlying store
 */
export type ImageThumbnailResultQuery = PayloadDivinerQueryPayload & Pick<ImageThumbnailResultIndex, QueryableImageThumbnailResultProperties>
