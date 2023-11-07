export type DivinerStageSchema = 'network.xyo.diviner.stage'
export const DivinerStageSchema: DivinerStageSchema = 'network.xyo.diviner.stage'

/**
 * The diviners for each stage of an indexing diviner
 */
export type IndexingDivinerStage =
  | 'stateToIndexCandidateDiviner'
  | 'indexCandidateToIndexDiviner'
  | 'divinerQueryToIndexQueryDiviner'
  | 'indexQueryResponseToDivinerQueryResponseDiviner'
