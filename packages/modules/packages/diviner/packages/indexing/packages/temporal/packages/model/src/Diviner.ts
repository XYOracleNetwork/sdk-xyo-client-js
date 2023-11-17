import { IndexingDiviner } from '@xyo-network/diviner-indexing-memory'
import { IndexingDivinerConfig, IndexingDivinerConfigSchema, IndexingDivinerParams, IndexingDivinerStage } from '@xyo-network/diviner-indexing-model'
import { DivinerConfigSchema, DivinerInstance, DivinerModule, DivinerModuleEventData } from '@xyo-network/diviner-model'
import { Payload } from '@xyo-network/payload-model'

type ConfigStoreKey = 'indexStore' | 'stateStore'

type ConfigStore = Extract<keyof IndexingDivinerConfig, ConfigStoreKey>

const moduleName = 'TemporalIndexingDiviner'

export class TemporalIndexingDiviner<
  TParams extends IndexingDivinerParams = IndexingDivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerModule<TParams>, TIn, TOut> = DivinerModuleEventData<DivinerModule<TParams>, TIn, TOut>,
> extends IndexingDiviner<TParams, TIn, TOut, TEventData> {
  static override readonly configSchemas = [IndexingDivinerConfigSchema, DivinerConfigSchema]

  private _divinerQueryToIndexQueryDiviner: DivinerInstance | undefined
  private _indexCandidateToIndexDiviner: DivinerInstance | undefined
  private _indexQueryResponseToDivinerQueryResponseDiviner: DivinerInstance | undefined
  private _stateToIndexCandidateDiviner: DivinerInstance | undefined

  private get divinerQueryToIndexQueryDiviner(): DivinerInstance {
    if (this._divinerQueryToIndexQueryDiviner) return this._divinerQueryToIndexQueryDiviner
    throw new Error('TODO: Create diviner')
  }
  private get indexCandidateToIndexDiviner(): DivinerInstance {
    if (this._indexCandidateToIndexDiviner) return this._indexCandidateToIndexDiviner
    throw new Error('TODO: Create diviner')
  }
  private get indexQueryResponseToDivinerQueryResponseDiviner(): DivinerInstance {
    if (this._indexQueryResponseToDivinerQueryResponseDiviner) return this._indexQueryResponseToDivinerQueryResponseDiviner
    throw new Error('TODO: Create diviner')
  }
  private get stateToIndexCandidateDiviner(): DivinerInstance {
    if (this._stateToIndexCandidateDiviner) return this._stateToIndexCandidateDiviner
    throw new Error('TODO: Create diviner')
  }

  /**
   * Gets the Diviner for the supplied Indexing Diviner stage
   * @param transform The Indexing Diviner stage
   * @returns The diviner corresponding to the Indexing Diviner stage
   */
  protected override getIndexingDivinerStage(transform: IndexingDivinerStage) {
    switch (transform) {
      case 'divinerQueryToIndexQueryDiviner':
        return Promise.resolve(this.divinerQueryToIndexQueryDiviner)
      case 'indexCandidateToIndexDiviner':
        return Promise.resolve(this.indexCandidateToIndexDiviner)
      case 'indexQueryResponseToDivinerQueryResponseDiviner':
        return Promise.resolve(this.indexQueryResponseToDivinerQueryResponseDiviner)
      case 'stateToIndexCandidateDiviner':
        return Promise.resolve(this.stateToIndexCandidateDiviner)
    }
  }

  protected override async startHandler(): Promise<boolean> {
    await super.startHandler()
    return true
  }
}
