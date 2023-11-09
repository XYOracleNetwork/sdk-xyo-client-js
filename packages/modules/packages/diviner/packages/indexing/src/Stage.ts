export type DivinerStageSchema = 'network.xyo.diviner.stage'
export const DivinerStageSchema: DivinerStageSchema = 'network.xyo.diviner.stage'

/**
 * The diviners for each stage of an indexing diviner
 */
export type IndexingDivinerStage =
  /**
   * Uses the current state to determine the next batch of index candidates
   */
  | 'stateToIndexCandidateDiviner'
  /**
   * Transforms the index candidates into indexes
   */
  | 'indexCandidateToIndexDiviner'
  /**
   * Transforms a diviner query into an index query
   */
  | 'divinerQueryToIndexQueryDiviner'
  /**
   * Transforms an index query response into a diviner divine query response
   */
  | 'indexQueryResponseToDivinerQueryResponseDiviner'

/**
 * Config section for declaring each indexing diviner stage
 */
export type IndexingDivinerStageConfig = {
  [key in IndexingDivinerStage]: string
}
