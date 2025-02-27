import { filterAs } from '@xylabs/array'
import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import type { ArchivistInstance, ArchivistNextOptions } from '@xyo-network/archivist-model'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import type { BoundWitness } from '@xyo-network/boundwitness-model'
import { asBoundWitness } from '@xyo-network/boundwitness-model'
import { payloadSchemasContainsAll } from '@xyo-network/boundwitness-validator'
import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import type { BoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-abstract'
import type { BoundWitnessDivinerParams, BoundWitnessDivinerQueryPayload } from '@xyo-network/diviner-boundwitness-model'
import type { IndexingDivinerState } from '@xyo-network/diviner-indexing-model'
import type { TemporalIndexingDivinerStateToIndexCandidateDivinerParams } from '@xyo-network/diviner-temporal-indexing-model'
import { TemporalIndexingDivinerStateToIndexCandidateDivinerConfigSchema } from '@xyo-network/diviner-temporal-indexing-model'
import { DivinerWrapper } from '@xyo-network/diviner-wrapper'
import type {
  Labels, ModuleIdentifier, ModuleState,
} from '@xyo-network/module-model'
import { isModuleState, ModuleStateSchema } from '@xyo-network/module-model'
import type {
  Payload, Schema,
  WithStorageMeta,
} from '@xyo-network/payload-model'
import { SequenceConstants } from '@xyo-network/payload-model'
import { intraBoundwitnessSchemaCombinations } from '@xyo-network/payload-utils'
import type { TimeStamp } from '@xyo-network/witness-timestamp'
import { TimestampSchema } from '@xyo-network/witness-timestamp'

/**
 * All Payload types involved in index candidates for indexing
 */
export type IndexCandidate = BoundWitness | Payload | TimeStamp

/**
 * The response from the TemporalStateToIndexCandidateDiviner
 */
export type TemporalStateToIndexCandidateDivinerResponse = [
  /**
   * The next state of the diviner
   */
  nextState: ModuleState<IndexingDivinerState>,
  /**
   * The index candidates
   */
  ...IndexCandidate[],
]

/**
 * The default order to search Bound Witnesses to identify index candidates
 */
const order = 'asc'

/**
 * The name of the module (for logging purposes)
 */
const moduleName = 'TemporalIndexingDivinerStateToIndexCandidateDiviner'

/**
 * Transforms candidates for image thumbnail indexing into their indexed representation
 */
export class TemporalIndexingDivinerStateToIndexCandidateDiviner<
  TParams extends TemporalIndexingDivinerStateToIndexCandidateDivinerParams = TemporalIndexingDivinerStateToIndexCandidateDivinerParams,
> extends AbstractDiviner<TParams, Payload, ModuleState | IndexCandidate> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, TemporalIndexingDivinerStateToIndexCandidateDivinerConfigSchema]
  static override readonly defaultConfigSchema: Schema = TemporalIndexingDivinerStateToIndexCandidateDivinerConfigSchema
  static override readonly labels: Labels = {
    ...super.labels,
    'network.xyo.diviner.stage': 'stateToIndexCandidateDiviner',
  }

  get payloadDivinerLimit() {
    return this.config.payloadDivinerLimit ?? 1000
  }

  /**
   * The required payload_schemas within BoundWitnesses to identify index candidates
   */
  protected get payload_schemas(): string[] {
    const schemas = this.config.filter?.payload_schemas
    return [TimestampSchema, ...(schemas ?? [])]
  }

  protected override async divineHandler(payloads: Payload[] = []): Promise<TemporalStateToIndexCandidateDivinerResponse> {
    // Retrieve the last state from what was passed in
    const lastState = payloads.find(isModuleState<IndexingDivinerState>)
    // If there is no last state, start from the beginning
      ?? { schema: ModuleStateSchema, state: { cursor: SequenceConstants.minLocalSequence } }

    // Get the last cursor
    const cursor = lastState?.state?.cursor
    // Get the archivist for the store
    const sourceArchivist = await this.getArchivistForStore()
    if (!sourceArchivist) return [lastState]

    // Get the next batch of results
    const nextOffset: ArchivistNextOptions = { limit: this.payloadDivinerLimit, order }
    // Only use the cursor if it's a valid offset
    if (cursor !== SequenceConstants.minLocalSequence) nextOffset.cursor = cursor
    // Get next batch of results starting from the offset
    const next = await sourceArchivist.next(nextOffset)
    if (next.length === 0) return [lastState]

    const batch = filterAs(next, asBoundWitness)
      .filter(exists)
      .filter(bw => payloadSchemasContainsAll(bw, this.payload_schemas))
    // Get source data
    const indexCandidates: IndexCandidate[] = (await Promise.all(batch.map(bw => this.getPayloadsInBoundWitness(bw, sourceArchivist))))
      .filter(exists)
      .flat()
    const nextCursor = assertEx(next.at(-1)?._sequence, () => `${moduleName}: Expected next to have a sequence`)
    const nextState: ModuleState<IndexingDivinerState> = { schema: ModuleStateSchema, state: { ...lastState.state, cursor: nextCursor } }
    return [nextState, ...indexCandidates]
  }

  /**
   * Retrieves the archivist for the payloadStore
   * @returns The archivist for the payloadStore or undefined if not resolvable
   */
  protected async getArchivistForStore(): Promise<ArchivistWrapper | undefined> {
    // It should be defined, so we'll error if it's not
    const name: ModuleIdentifier = assertEx(
      this.config?.payloadStore?.archivist,
      () => `${moduleName}: Config for payloadStore.archivist not specified`,
    )
    // It might not be resolvable (yet), so we'll return undefined if it's not
    const mod = await this.resolve(name)
    if (!mod) return undefined
    // Return the wrapped archivist
    return ArchivistWrapper.wrap(mod, this.account)
  }

  /**
   * Retrieves the BoundWitness Diviner for the payloadStore
   * @returns The BoundWitness Diviner for the payloadStore or undefined if not resolvable
   */
  protected async getBoundWitnessDivinerForStore() {
    // It should be defined, so we'll error if it's not
    const name: ModuleIdentifier = assertEx(
      this.config?.payloadStore?.boundWitnessDiviner,
      () => `${moduleName}: Config for payloadStore.boundWitnessDiviner not specified`,
    )
    // It might not be resolvable (yet), so we'll return undefined if it's not
    const mod = await this.resolve(name)
    if (!mod) return
    // Return the wrapped diviner
    return DivinerWrapper.wrap<
      DivinerWrapper<
        BoundWitnessDiviner<BoundWitnessDivinerParams, BoundWitnessDivinerQueryPayload, BoundWitness>,
        BoundWitnessDivinerQueryPayload,
        WithStorageMeta<BoundWitness>
      >
    >(mod, this.account)
  }

  protected async getPayloadsInBoundWitness(bw: BoundWitness, archivist: ArchivistInstance): Promise<IndexCandidate[] | undefined> {
    const combinations = intraBoundwitnessSchemaCombinations(bw, this.payload_schemas).flat()
    if (combinations.length === 0) return undefined
    const hashes = new Set(combinations)
    const indexCandidates = await archivist.get([...hashes])
    return [bw, ...indexCandidates]
  }
}
