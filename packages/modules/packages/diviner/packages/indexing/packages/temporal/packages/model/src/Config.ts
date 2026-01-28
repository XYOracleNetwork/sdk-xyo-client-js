import type { IndexingDivinerStage, IndexingDivinerStageConfig } from '@xyo-network/diviner-indexing-model'
import type { SchemaToJsonPathTransformExpressionsDictionary } from '@xyo-network/diviner-jsonpath-model'
import type { DivinerConfig, SearchableStorage } from '@xyo-network/diviner-model'
import { asSchema } from '@xyo-network/payload-model'

import type { TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfig } from './DivinerQueryToIndexQueryDiviner/index.ts'
import type { TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDivinerConfig } from './IndexQueryResponseToDivinerQueryResponseDiviner/index.ts'
import { TemporalIndexingDivinerSchema } from './Schema.ts'
import type { TemporalIndexingDivinerStateToIndexCandidateDivinerConfig } from './StateToIndexCandidateDiviner/index.ts'

export const TemporalIndexingDivinerConfigSchema = asSchema(`${TemporalIndexingDivinerSchema}.config`, true)
export type TemporalIndexingDivinerConfigSchema = typeof TemporalIndexingDivinerConfigSchema

/**
 * Config section for declaring each indexing diviner stage
 */
export type IndexingDivinerStageTransformConfig = {
  [key in IndexingDivinerStage]: SchemaToJsonPathTransformExpressionsDictionary
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
