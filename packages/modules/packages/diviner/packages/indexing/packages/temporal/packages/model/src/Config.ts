import { IndexingDivinerConfig, IndexingDivinerStage, IndexingDivinerStageConfig } from '@xyo-network/diviner-indexing-model'
import { DivinerConfig } from '@xyo-network/diviner-model'

import { StringToJsonPathTransformExpressionsDictionary } from './jsonpath'
import { TemporalIndexingDivinerSchema } from './Schema'

export const TemporalIndexingDivinerConfigSchema = `${TemporalIndexingDivinerSchema}.config` as const
export type TemporalIndexingDivinerConfigSchema = typeof TemporalIndexingDivinerConfigSchema

/**
 * Config section for declaring each indexing diviner stage
 */
export type IndexingDivinerStageTransformConfig = {
  [key in IndexingDivinerStage]: StringToJsonPathTransformExpressionsDictionary
}

// TODO: Extend indexing diviner config and just remove fields that are not needed?
export type TemporalIndexingDivinerConfig = IndexingDivinerConfig & {
  /**
   * Optional config section for JSON Transform description of individual diviner stages
   */
  indexingDivinerTransforms?: IndexingDivinerStageTransformConfig
  /**
   * The schema for this config
   */
  schema: TemporalIndexingDivinerConfigSchema
}
