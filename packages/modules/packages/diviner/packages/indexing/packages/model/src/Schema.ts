import { asSchema } from '@xyo-network/payload-model'

export const IndexingDivinerSchema = asSchema('network.xyo.diviner.indexing', true)
export type ImageThumbnailDivinerSchema = typeof IndexingDivinerSchema
