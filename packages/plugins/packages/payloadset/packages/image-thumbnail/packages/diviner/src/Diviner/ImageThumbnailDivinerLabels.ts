import { DivinerStageSchema, IndexingDivinerStage } from '@xyo-network/diviner-indexing'
import { Labels } from '@xyo-network/module-model'

/**
 * Labels for Image Thumbnail Diviner components
 */
export interface ImageThumbnailDivinerLabels extends Labels {
  'network.xyo.image.thumbnail': 'diviner'
}

/**
 * Labels for Image Thumbnail Diviner components
 */
export const ImageThumbnailDivinerLabels: ImageThumbnailDivinerLabels = {
  'network.xyo.image.thumbnail': 'diviner',
}

/**
 * Labels for Image Thumbnail Diviner Stage Diviners
 */
export type ImageThumbnailDivinerStageLabels = ImageThumbnailDivinerLabels & {
  /**
   * Labels for the stage of the Image Thumbnail Diviner Stage Diviner
   */
  [key in DivinerStageSchema]: IndexingDivinerStage
}
