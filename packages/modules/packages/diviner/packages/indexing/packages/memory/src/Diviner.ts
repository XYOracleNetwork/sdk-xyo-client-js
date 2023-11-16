import { assertEx } from '@xylabs/assert'
import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { isBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessDivinerQueryPayload, BoundWitnessDivinerQuerySchema } from '@xyo-network/diviner-boundwitness-model'
import {
  IndexingDivinerConfig,
  IndexingDivinerConfigSchema,
  IndexingDivinerParams,
  IndexingDivinerStage,
  IndexingDivinerState,
} from '@xyo-network/diviner-indexing-model'
import { asDivinerInstance, DivinerConfigSchema, DivinerModule, DivinerModuleEventData } from '@xyo-network/diviner-model'
import { DivinerWrapper } from '@xyo-network/diviner-wrapper'
import { isModuleState, ModuleState, ModuleStateSchema } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'

type ConfigStoreKey = 'indexStore' | 'stateStore'

type ConfigStore = Extract<keyof IndexingDivinerConfig, ConfigStoreKey>

const moduleName = 'IndexingDiviner'

export class IndexingDiviner<
  TParams extends IndexingDivinerParams = IndexingDivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerModule<TParams>, TIn, TOut> = DivinerModuleEventData<DivinerModule<TParams>, TIn, TOut>,
> extends AbstractDiviner<TParams, TIn, TOut, TEventData> {
  static override readonly configSchemas = [IndexingDivinerConfigSchema, DivinerConfigSchema]

  private _lastState?: ModuleState<IndexingDivinerState>
  private _pollId?: string | number | NodeJS.Timeout

  get payloadDivinerLimit() {
    return this.config.payloadDivinerLimit ?? 1_000
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
    const nextState = results.find(isModuleState<IndexingDivinerState>)
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
  }

  /**
   * Commit the internal state of the Diviner process. This is similar
   * to a transaction completion in a database and should only be called
   * when results have been successfully persisted to the appropriate
   * external stores.
   * @param nextState The state to commit
   */
  protected async commitState(nextState: ModuleState<IndexingDivinerState>) {
    // Don't commit state if no state has changed
    if (nextState.state.offset === this._lastState?.state.offset) return
    this._lastState = nextState
    const archivist = await this.getArchivistForStore('stateStore')
    const [bw] = await new BoundWitnessBuilder().payload(nextState).witness(this.account).build()
    await archivist.insert([bw, nextState])
  }

  protected override async divineHandler(payloads: TIn[] = []): Promise<TOut[]> {
    const indexPayloadDiviner = await this.getPayloadDivinerForStore('indexStore')
    const divinerQueryToIndexQueryDiviner = await this.getIndexingDivinerStage('divinerQueryToIndexQueryDiviner')
    const indexQueryResponseToDivinerQueryResponseDiviner = await this.getIndexingDivinerStage('indexQueryResponseToDivinerQueryResponseDiviner')
    const results = (
      await Promise.all(
        payloads.map(async (payload) => {
          const indexQuery = await divinerQueryToIndexQueryDiviner.divine([payload])
          // Divine the results
          const indexedResults = await indexPayloadDiviner.divine(indexQuery)
          // Transform the results to the response shape
          const response = await Promise.all(
            indexedResults.flat().map((indexedResult) => indexQueryResponseToDivinerQueryResponseDiviner.divine([payload, indexedResult])),
          )
          return response.flat()
        }),
      )
    ).flat()
    // TODO: Infer this type over casting to this type
    return results as TOut[]
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
    const nameOrAddress = assertEx(
      this.config?.indexingDivinerStages?.[transform],
      () => `${moduleName}: Config for indexingDivinerStages.${transform} not specified`,
    )
    const mod = await this.resolve(nameOrAddress)
    return assertEx(asDivinerInstance(mod), () => `${moduleName}: Failed to resolve indexing diviner stage for ${transform}`)
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
  protected async retrieveState(): Promise<ModuleState<IndexingDivinerState> | undefined> {
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
      const payload = (await archivist.get([hash])).find(isModuleState<IndexingDivinerState>)
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
