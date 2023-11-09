import { Labels } from '@xyo-network/module-model'

import { DivinerStageSchema, IndexingDivinerStage } from './Stage'

/**
 * Labels for Indexing Diviner Stage Diviners
 */
export type IndexingDivinerStageLabels = Labels & {
  /**
   * Labels for the stage of the Indexing Diviner Stage Diviner
   */
  [key in DivinerStageSchema]: IndexingDivinerStage
}
