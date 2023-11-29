import { IndexingDivinerStage, IndexingDivinerStageConfig, SearchableStorage } from '@xyo-network/diviner-indexing-model'
import { DivinerConfig } from '@xyo-network/diviner-model'

import { TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfig } from './DivinerQueryToIndexQueryDiviner'
import { TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDivinerConfig } from './IndexQueryResponseToDivinerQueryResponseDiviner'
import { StringToJsonPathTransformExpressionsDictionary } from './jsonpath'
import { TemporalIndexingDivinerSchema } from './Schema'
import { TemporalIndexingDivinerStateToIndexCandidateDivinerConfig } from './StateToIndexCandidateDiviner'

export const TemporalIndexingDivinerConfigSchema = `${TemporalIndexingDivinerSchema}.config` as const
export type TemporalIndexingDivinerConfigSchema = typeof TemporalIndexingDivinerConfigSchema

/**
 * Config section for declaring each indexing diviner stage
 */
export type IndexingDivinerStageTransformConfig = {
  [key in IndexingDivinerStage]: StringToJsonPathTransformExpressionsDictionary
}

// TODO: Extend indexing diviner config
/**
 * Diviner Config for a Diviner which Indexes Payloads
 */
export type TemporalIndexingDivinerConfig = DivinerConfig<{
  /**
   * Where the diviner should store it's index
   */
  indexStore?: SearchableStorage
  /**
   * Config section for name/address of individual diviner stages
   */
  indexingDivinerStages?: IndexingDivinerStageConfig
  /**
   * The maximum number of payloads to index at a time
   */
  payloadDivinerLimit?: number
  /**
   * How often to poll for new payloads to index
   */
  pollFrequency?: number
  /**
   * The schema for this config
   */
  schema: TemporalIndexingDivinerConfigSchema
  /**
   * Optional config section for individual diviner stages
   */
  stageConfigs?: {
    divinerQueryToIndexQueryDiviner?: Omit<TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfig, 'schema'>
    indexCandidateToIndexDiviner?: Omit<TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfig, 'schema'>
    indexQueryResponseToDivinerQueryResponseDiviner?: Omit<TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDivinerConfig, 'schema'>
    stateToIndexCandidateDiviner?: Omit<TemporalIndexingDivinerStateToIndexCandidateDivinerConfig, 'schema'>
  }
  /**
   * Where the diviner should persist its internal state
   */
  stateStore?: SearchableStorage
}>
