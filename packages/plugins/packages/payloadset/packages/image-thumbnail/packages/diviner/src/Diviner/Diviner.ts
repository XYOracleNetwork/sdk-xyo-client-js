import { assertEx } from '@xylabs/assert'
import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { isBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessDivinerQueryPayload, BoundWitnessDivinerQuerySchema } from '@xyo-network/diviner-boundwitness-model'
import { asDivinerInstance, DivinerConfigSchema } from '@xyo-network/diviner-model'
import { DivinerWrapper } from '@xyo-network/diviner-wrapper'
import {
  ImageThumbnailDivinerConfig,
  ImageThumbnailDivinerConfigSchema,
  ImageThumbnailDivinerParams,
  isImageThumbnailDivinerQuery,
  isImageThumbnailResult,
} from '@xyo-network/image-thumbnail-payload-plugin'
import { isModuleState, ModuleState, ModuleStateSchema } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'

import { ImageThumbnailDivinerLabels } from './ImageThumbnailDivinerLabels'
import { ImageThumbnailDivinerState } from './ImageThumbnailDivinerState'
import { ImageThumbnailIndexCandidateToImageThumbnailIndexDiviner } from './ImageThumbnailIndexCandidateToImageThumbnailIndexDiviner'
import { ImageThumbnailIndexQueryResponseToImageThumbnailQueryResponseDiviner } from './ImageThumbnailIndexQueryResponseToImageThumbnailQueryResponseDiviner'
import { ImageThumbnailQueryToImageThumbnailIndexQueryDiviner } from './ImageThumbnailQueryToImageThumbnailIndexQueryDiviner'
import { IndexingDivinerStage } from './IndexingDivinerStage'

type ConfigStoreKey = 'indexStore' | 'stateStore' | 'thumbnailStore'

type ConfigStore = Extract<keyof ImageThumbnailDivinerConfig, ConfigStoreKey>

const moduleName = 'ImageThumbnailDiviner'

export class ImageThumbnailDiviner<TParams extends ImageThumbnailDivinerParams = ImageThumbnailDivinerParams> extends AbstractDiviner<TParams> {
  static override configSchemas = [ImageThumbnailDivinerConfigSchema, DivinerConfigSchema]
  static labels: ImageThumbnailDivinerLabels = ImageThumbnailDivinerLabels

  private _lastState?: ModuleState<ImageThumbnailDivinerState>
  private _pollId?: string | number | NodeJS.Timeout

  get payloadDivinerLimit() {
    return this.config.payloadDivinerLimit ?? 1_0000
  }

  get pollFrequency() {
    return this.config.pollFrequency ?? 10_000
  }

  /**
   * Works via batched iteration of the source archivist to populate the index.
   * @returns A promise that resolves when the background process is complete
   */
  protected backgroundDivine = async (): Promise<void> => {
    // Load last state
    const lastState = await this.retrieveState()
    // Get next batch of results
    const indexCandidateDiviner = await this.getIndexingDivinerStage('stateToIndexCandidateDiviner')
    const results = lastState ? await indexCandidateDiviner.divine([lastState]) : await indexCandidateDiviner.divine()
    // Filter next state out from results
    const nextState = results.find(isModuleState<ImageThumbnailDivinerState>)
    const indexCandidates = results.filter((x) => !isModuleState(x))
    // Transform candidates to indexes
    const toIndexTransformDiviner = await this.getIndexingDivinerStage('indexCandidateToIndexDiviner')
    const indexes = await toIndexTransformDiviner.divine(indexCandidates)
    // Insert index results
    const indexArchivist = await this.getArchivistForStore('indexStore')
    await indexArchivist.insert(indexes)
    // Update state
    if (nextState) {
      await this.commitState(nextState)
    }
    // TODO: Emit events for new indexes
  }

  /**
   * Commit the internal state of the Diviner process. This is similar
   * to a transaction completion in a database and should only be called
   * when results have been successfully persisted to the appropriate
   * external stores.
   * @param state The state to commit
   */
  protected async commitState(state: ModuleState<ImageThumbnailDivinerState>) {
    this._lastState = state
    const archivist = await this.getArchivistForStore('stateStore')
    const [bw] = await new BoundWitnessBuilder().payload(state).witness(this.account).build()
    await archivist.insert([bw, state])
  }

  protected override async divineHandler(payloads: Payload[] = []): Promise<Payload[]> {
    const urls = payloads.filter(isImageThumbnailDivinerQuery)
    const indexPayloadDiviner = await this.getPayloadDivinerForStore('indexStore')
    const divinerQueryToIndexQueryDiviner = await this.getIndexingDivinerStage('divinerQueryToIndexQueryDiviner')
    const indexQueryResponseToDivinerQueryResponseDiviner = await this.getIndexingDivinerStage('indexQueryResponseToDivinerQueryResponseDiviner')
    const results = (
      await Promise.all(
        urls.map(async (divinerQuery) => {
          const indexQuery = await divinerQueryToIndexQueryDiviner.divine([divinerQuery])
          // Divine the results
          const indexedResults = await indexPayloadDiviner.divine(indexQuery)
          // Transform the results to the response shape
          const response = await Promise.all(
            indexedResults.flat().map((indexedResult) => indexQueryResponseToDivinerQueryResponseDiviner.divine([divinerQuery, indexedResult])),
          )
          return response.flat()
        }),
      )
    )
      .flat()
      .filter(isImageThumbnailResult)
    return results
  }

  /**
   * Retrieves the archivist for the specified store
   * @param store The store to retrieve the archivist for
   * @returns The archivist for the specified store
   */
  protected async getArchivistForStore(store: ConfigStore) {
    const name = assertEx(this.config?.[store]?.archivist, () => `${moduleName}: Config for ${store}.archivist not specified`)
    const mod = assertEx(await this.resolve(name), () => `${moduleName}: Failed to resolve ${store}.archivist`)
    return ArchivistWrapper.wrap(mod, this.account)
  }

  /**
   * Retrieves the BoundWitness Diviner for the specified store
   * @param store The store to retrieve the BoundWitness Diviner for
   * @returns The BoundWitness Diviner for the specified store
   */
  protected async getBoundWitnessDivinerForStore(store: ConfigStore) {
    const name = assertEx(this.config?.[store]?.boundWitnessDiviner, () => `${moduleName}: Config for ${store}.boundWitnessDiviner not specified`)
    const mod = assertEx(await this.resolve(name), () => `${moduleName}: Failed to resolve ${store}.boundWitnessDiviner`)
    return DivinerWrapper.wrap(mod, this.account)
  }

  /**
   * Gets the Diviner for the supplied Indexing Diviner stage
   * @param transform The Indexing Diviner stage
   * @returns The diviner corresponding to the Indexing Diviner stage
   */
  protected async getIndexingDivinerStage(transform: IndexingDivinerStage) {
    // TODO: Actually get these diviners from config
    switch (transform) {
      case 'stateToIndexCandidateDiviner': {
        const mod = await this.resolve('ImageThumbnailStateToIndexCandidateDiviner')
        return assertEx(asDivinerInstance(mod), () => `${moduleName}: Failed to resolve diviner for ${transform}`)
      }
      case 'indexCandidateToIndexDiviner':
        return await ImageThumbnailIndexCandidateToImageThumbnailIndexDiviner.create()
      case 'divinerQueryToIndexQueryDiviner':
        return await ImageThumbnailQueryToImageThumbnailIndexQueryDiviner.create()
      case 'indexQueryResponseToDivinerQueryResponseDiviner':
        return await ImageThumbnailIndexQueryResponseToImageThumbnailQueryResponseDiviner.create()
    }
  }

  /**
   * Retrieves the Payload Diviner for the specified store
   * @param store The store to retrieve the Payload Diviner for
   * @returns The Payload Diviner for the specified store
   */
  protected async getPayloadDivinerForStore(store: ConfigStore) {
    const name = assertEx(this.config?.[store]?.payloadDiviner, () => `${moduleName}: Config for ${store}.payloadDiviner not specified`)
    const mod = assertEx(await this.resolve(name), () => `${moduleName}: Failed to resolve ${store}.payloadDiviner`)
    return DivinerWrapper.wrap(mod, this.account)
  }

  /**
   * Retrieves the last state of the Diviner process. Used to recover state after
   * preemptions, reboots, etc.
   */
  protected async retrieveState(): Promise<ModuleState<ImageThumbnailDivinerState> | undefined> {
    if (this._lastState) return this._lastState
    let hash: string = ''
    const diviner = await this.getBoundWitnessDivinerForStore('stateStore')
    const query = new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema })
      .fields({
        address: this.account.address,
        limit: 1,
        offset: 0,
        order: 'desc',
        payload_schemas: [ModuleStateSchema],
      })
      .build()
    const boundWitnesses = await diviner.divine([query])
    if (boundWitnesses.length > 0) {
      const boundWitness = boundWitnesses[0]
      if (isBoundWitness(boundWitness)) {
        // Find the index for this address in the BoundWitness that is a ModuleState
        hash = boundWitness.addresses
          .map((address, index) => ({ address, index }))
          .filter(({ address }) => address === this.account.address)
          .reduce(
            (prev, curr) => (boundWitness.payload_schemas?.[curr?.index] === ModuleStateSchema ? boundWitness.payload_hashes[curr?.index] : prev),
            '',
          )
      }
    }

    // If we able to located the last state
    if (hash) {
      // Get last state
      const archivist = await this.getArchivistForStore('stateStore')
      const payload = (await archivist.get([hash])).find(isModuleState<ImageThumbnailDivinerState>)
      if (payload) {
        return payload
      }
    }
    return undefined
  }

  protected override async startHandler(): Promise<boolean> {
    await super.startHandler()
    this.poll()
    return true
  }

  protected override async stopHandler(_timeout?: number | undefined): Promise<boolean> {
    if (this._pollId) {
      clearTimeout(this._pollId)
      this._pollId = undefined
    }
    return await super.stopHandler()
  }

  /**
   * Runs the background divine process on a loop with a delay
   * specified by the `config.pollFrequency`
   */
  private poll() {
    this._pollId = setTimeout(async () => {
      try {
        await this.backgroundDivine()
      } catch (e) {
        console.log(e)
      } finally {
        if (this._pollId) clearTimeout(this._pollId)
        this._pollId = undefined
        this.poll()
      }
    }, this.pollFrequency)
  }
}
