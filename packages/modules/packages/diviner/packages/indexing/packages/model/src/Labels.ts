import type { Labels } from '@xyo-network/module-model'

import type { DivinerStageSchema, IndexingDivinerStage } from './Stage.ts'

/**
 * Labels for Indexing Diviner Stage Diviners
 */
export type IndexingDivinerStageLabels = Labels & {
  /**
   * Labels for the stage of the Indexing Diviner Stage Diviner
   */
  [key in DivinerStageSchema]: IndexingDivinerStage
}
