/**
 * The diviners for each stage of an indexing diviner
 */
export type IndexingDivinerStage =
  | 'stateToIndexCandidateDiviner'
  | 'indexCandidateToIndexDiviner'
  | 'divinerQueryToIndexQueryDiviner'
  | 'indexQueryResponseToDivinerQueryResponseDiviner'
