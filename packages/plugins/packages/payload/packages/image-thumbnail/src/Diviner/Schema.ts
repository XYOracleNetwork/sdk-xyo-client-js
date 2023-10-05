import { ImageThumbnailSchema } from '../Schema'

export const ImageThumbnailDivinerSchema = `${ImageThumbnailSchema}.diviner` as const
export type ImageThumbnailDivinerSchema = typeof ImageThumbnailDivinerSchema
