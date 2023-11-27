import { assertEx } from '@xylabs/assert'
import { IndexingDiviner } from '@xyo-network/diviner-indexing-memory'
import { IndexingDivinerConfigSchema, IndexingDivinerStage } from '@xyo-network/diviner-indexing-model'
import { DivinerConfigSchema, DivinerInstance, DivinerModule, DivinerModuleEventData } from '@xyo-network/diviner-model'
import { TemporalIndexingDivinerParams } from '@xyo-network/diviner-temporal-indexing-model'
import { Payload } from '@xyo-network/payload-model'

// type ConfigStoreKey = 'indexStore' | 'stateStore'

// type ConfigStore = Extract<keyof IndexingDivinerConfig, ConfigStoreKey>

// const moduleName = 'TemporalIndexingDiviner'

export class TemporalIndexingDiviner<
  TParams extends TemporalIndexingDivinerParams = TemporalIndexingDivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerModule<TParams>, TIn, TOut> = DivinerModuleEventData<DivinerModule<TParams>, TIn, TOut>,
> extends IndexingDiviner<TParams, TIn, TOut, TEventData> {
  static override readonly configSchemas = [IndexingDivinerConfigSchema, DivinerConfigSchema]

  private _divinerQueryToIndexQueryDiviner: DivinerInstance | undefined
  private _indexCandidateToIndexDiviner: DivinerInstance | undefined
  private _indexQueryResponseToDivinerQueryResponseDiviner: DivinerInstance | undefined
  private _stateToIndexCandidateDiviner: DivinerInstance | undefined

  /**
   * Gets the Diviner for the supplied Indexing Diviner stage
   * @param transform The Indexing Diviner stage
   * @returns The diviner corresponding to the Indexing Diviner stage
   */
  protected override getIndexingDivinerStage(transform: IndexingDivinerStage) {
    switch (transform) {
      case 'divinerQueryToIndexQueryDiviner':
        return this.getDivinerQueryToIndexQueryDiviner()
      case 'indexCandidateToIndexDiviner':
        return this.getIndexCandidateToIndexDiviner()
      case 'indexQueryResponseToDivinerQueryResponseDiviner':
        return this.getIndexQueryResponseToDivinerQueryResponseDiviner()
      case 'stateToIndexCandidateDiviner':
        return this.getStateToIndexCandidateDiviner()
    }
  }

  protected override async startHandler(): Promise<boolean> {
    await super.startHandler()
    return true
  }

  private async getDivinerQueryToIndexQueryDiviner(): Promise<DivinerInstance> {
    if (!this._divinerQueryToIndexQueryDiviner) {
      const name = this.config.indexingDivinerStages?.divinerQueryToIndexQueryDiviner
      if (name) {
        this._divinerQueryToIndexQueryDiviner = await this.resolve(name)
      } else {
        throw new Error('TODO: Create diviner')
      }
    }
    return assertEx(this._divinerQueryToIndexQueryDiviner, 'divinerQueryToIndexQueryDiviner')
  }
  private async getIndexCandidateToIndexDiviner(): Promise<DivinerInstance> {
    if (!this._indexCandidateToIndexDiviner) {
      const name = this.config.indexingDivinerStages?.indexCandidateToIndexDiviner
      if (name) {
        this._indexCandidateToIndexDiviner = await this.resolve(name)
      } else {
        throw new Error('TODO: Create diviner')
      }
    }
    return assertEx(this._indexCandidateToIndexDiviner, 'indexCandidateToIndexDiviner')
  }
  private async getIndexQueryResponseToDivinerQueryResponseDiviner(): Promise<DivinerInstance> {
    if (!this._indexQueryResponseToDivinerQueryResponseDiviner) {
      const name = this.config.indexingDivinerStages?.indexQueryResponseToDivinerQueryResponseDiviner
      if (name) {
        this._indexQueryResponseToDivinerQueryResponseDiviner = await this.resolve(name)
      } else {
        throw new Error('TODO: Create diviner')
      }
    }
    return assertEx(this._indexQueryResponseToDivinerQueryResponseDiviner, 'indexQueryResponseToDivinerQueryResponseDiviner')
  }
  private async getStateToIndexCandidateDiviner(): Promise<DivinerInstance> {
    if (!this._stateToIndexCandidateDiviner) {
      const name = this.config.indexingDivinerStages?.stateToIndexCandidateDiviner
      if (name) {
        this._stateToIndexCandidateDiviner = await this.resolve(name)
      } else {
        throw new Error('TODO: Create diviner')
      }
    }
    return assertEx(this._stateToIndexCandidateDiviner, 'stateToIndexCandidateDiviner')
  }
}
