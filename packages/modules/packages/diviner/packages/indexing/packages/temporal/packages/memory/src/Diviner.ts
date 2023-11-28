import { assertEx } from '@xylabs/assert'
import { IndexingDiviner } from '@xyo-network/diviner-indexing-memory'
import { IndexingDivinerConfigSchema, IndexingDivinerStage } from '@xyo-network/diviner-indexing-model'
import { DivinerConfigSchema, DivinerInstance, DivinerModule, DivinerModuleEventData } from '@xyo-network/diviner-model'
import {
  TemporalIndexingDivinerConfigSchema,
  TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfigSchema,
  TemporalIndexingDivinerIndexCandidateToIndexDivinerConfigSchema,
  TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDivinerConfigSchema,
  TemporalIndexingDivinerParams,
  TemporalIndexingDivinerStateToIndexCandidateDivinerConfigSchema,
} from '@xyo-network/diviner-temporal-indexing-model'
import { ModuleInstance } from '@xyo-network/module-model'
import { asNodeInstance } from '@xyo-network/node-model'
import { Payload } from '@xyo-network/payload-model'

import { TemporalIndexingDivinerDivinerQueryToIndexQueryDiviner } from './DivinerQueryToIndexQueryDiviner'
import { TemporalIndexingDivinerIndexCandidateToIndexDiviner } from './IndexCandidateToIndexDiviner'
import { TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDiviner } from './IndexQueryResponseToDivinerQueryResponseDiviner'
import { TemporalIndexingDivinerStateToIndexCandidateDiviner } from './StateToIndexCandidateDiviner'

const moduleName = 'TemporalIndexingDiviner'

export class TemporalIndexingDiviner<
  TParams extends TemporalIndexingDivinerParams = TemporalIndexingDivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerModule<TParams>, TIn, TOut> = DivinerModuleEventData<DivinerModule<TParams>, TIn, TOut>,
> extends IndexingDiviner<TParams, TIn, TOut, TEventData> {
  static override readonly configSchema = TemporalIndexingDivinerConfigSchema
  static override readonly configSchemas: string[] = [TemporalIndexingDivinerConfigSchema, IndexingDivinerConfigSchema, DivinerConfigSchema]

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

  /**
   * Adds the supplied module to the parent Node of this Diviner
   * @param mod The module to add to the parent Node of this Diviner
   * @returns
   */
  private async attachModuleToParentNode(mod: ModuleInstance) {
    const parent = (await this.resolve({ maxDepth: 1, query: [['network.xyo.query.node.attach']] })).shift()
    if (parent) {
      const node = asNodeInstance(parent)
      if (node) {
        await node.register(mod)
        await node.attach(mod.address, false)
      }
    }
  }

  private async getDivinerQueryToIndexQueryDiviner(): Promise<DivinerInstance> {
    if (!this._divinerQueryToIndexQueryDiviner) {
      const name = this.config.indexingDivinerStages?.divinerQueryToIndexQueryDiviner
      if (name) {
        this._divinerQueryToIndexQueryDiviner = await this.resolve(name)
      } else {
        const stageConfig = this.config.stageConfigs?.divinerQueryToIndexQueryDiviner
        if (stageConfig) {
          const config = { schema: TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfigSchema, ...stageConfig }
          const stage = await TemporalIndexingDivinerDivinerQueryToIndexQueryDiviner.create({ config })
          await this.attachModuleToParentNode(stage)
          this._divinerQueryToIndexQueryDiviner = stage
        }
      }
    }
    return assertEx(
      this._divinerQueryToIndexQueryDiviner,
      () => `${moduleName}: Failed to resolve indexing diviner stage for divinerQueryToIndexQueryDiviner`,
    )
  }
  private async getIndexCandidateToIndexDiviner(): Promise<DivinerInstance> {
    if (!this._indexCandidateToIndexDiviner) {
      const name = this.config.indexingDivinerStages?.indexCandidateToIndexDiviner
      if (name) {
        this._indexCandidateToIndexDiviner = await this.resolve(name)
      } else {
        const stageConfig = this.config.stageConfigs?.indexCandidateToIndexDiviner
        if (stageConfig) {
          const config = { schema: TemporalIndexingDivinerIndexCandidateToIndexDivinerConfigSchema, ...stageConfig }
          const stage = await TemporalIndexingDivinerIndexCandidateToIndexDiviner.create({ config })
          await this.attachModuleToParentNode(stage)
          this._indexCandidateToIndexDiviner = stage
        }
      }
    }
    return assertEx(
      this._indexCandidateToIndexDiviner,
      () => `${moduleName}: Failed to resolve indexing diviner stage for indexCandidateToIndexDiviner`,
    )
  }
  private async getIndexQueryResponseToDivinerQueryResponseDiviner(): Promise<DivinerInstance> {
    if (!this._indexQueryResponseToDivinerQueryResponseDiviner) {
      const name = this.config.indexingDivinerStages?.indexQueryResponseToDivinerQueryResponseDiviner
      if (name) {
        this._indexQueryResponseToDivinerQueryResponseDiviner = await this.resolve(name)
      } else {
        const stageConfig = this.config.stageConfigs?.indexQueryResponseToDivinerQueryResponseDiviner
        if (stageConfig) {
          const config = { schema: TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDivinerConfigSchema, ...stageConfig }
          const stage = await TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDiviner.create({ config })
          await this.attachModuleToParentNode(stage)
          this._indexQueryResponseToDivinerQueryResponseDiviner = stage
        }
      }
    }
    return assertEx(
      this._indexQueryResponseToDivinerQueryResponseDiviner,
      () => `${moduleName}: Failed to resolve indexing diviner stage for indexQueryResponseToDivinerQueryResponseDiviner`,
    )
  }
  private async getStateToIndexCandidateDiviner(): Promise<DivinerInstance> {
    if (!this._stateToIndexCandidateDiviner) {
      const name = this.config.indexingDivinerStages?.stateToIndexCandidateDiviner
      if (name) {
        this._stateToIndexCandidateDiviner = await this.resolve(name)
      } else {
        const stageConfig = this.config.stageConfigs?.stateToIndexCandidateDiviner
        if (stageConfig) {
          const config = { schema: TemporalIndexingDivinerStateToIndexCandidateDivinerConfigSchema, ...stageConfig }
          const stage = await TemporalIndexingDivinerStateToIndexCandidateDiviner.create({ config })
          await this.attachModuleToParentNode(stage)
          this._stateToIndexCandidateDiviner = stage
        }
      }
    }
    return assertEx(
      this._stateToIndexCandidateDiviner,
      () => `${moduleName}: Failed to resolve indexing diviner stage for stateToIndexCandidateDiviner`,
    )
  }
}
