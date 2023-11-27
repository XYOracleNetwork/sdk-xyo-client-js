import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { ArchivistInstance } from '@xyo-network/archivist-model'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { BoundWitness, isBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessDivinerQueryPayload, BoundWitnessDivinerQuerySchema } from '@xyo-network/diviner-boundwitness-model'
import { IndexingDivinerState } from '@xyo-network/diviner-indexing-model'
import { DivinerConfigSchema } from '@xyo-network/diviner-model'
import { DivinerWrapper } from '@xyo-network/diviner-wrapper'
import { isModuleState, Labels, ModuleState, ModuleStateSchema } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'
import { TimeStamp, TimestampSchema } from '@xyo-network/witness-timestamp'

import { TemporalStateToIndexCandidateDivinerConfigSchema } from './Config'
import { TemporalStateToIndexCandidateDivinerParams as TemporalIndexingDivinerStateToIndexCandidateDiviner } from './Params'

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
const moduleName = 'TemporalStateToIndexCandidateDiviner'

/**
 * Transforms candidates for image thumbnail indexing into their indexed representation
 */
export class TemporalStateToIndexCandidateDiviner<
  TParams extends TemporalIndexingDivinerStateToIndexCandidateDiviner = TemporalIndexingDivinerStateToIndexCandidateDiviner,
> extends AbstractDiviner<TParams> {
  static override readonly configSchema = TemporalStateToIndexCandidateDivinerConfigSchema
  static override configSchemas = [DivinerConfigSchema, TemporalStateToIndexCandidateDivinerConfigSchema]
  static labels: Labels = {
    'network.xyo.diviner.stage': 'stateToIndexCandidateDiviner',
  }

  get payloadDivinerLimit() {
    return this.config.payloadDivinerLimit ?? 1_000
  }

  /**
   * The required payload_schemas within BoundWitnesses to identify index candidates
   */
  protected get payload_schemas(): string[] {
    const schemas = this.config.filter?.payload_schemas
    return [TimestampSchema, ...(schemas ?? [])]
  }

  protected override async divineHandler(payloads: Payload[] = []): Promise<[ModuleState, ...IndexCandidate[]]> {
    // Retrieve the last state from what was passed in
    const lastState = payloads.find(isModuleState<IndexingDivinerState>)
    // If there is no last state, start from the beginning
    if (!lastState) return [{ schema: ModuleStateSchema, state: { offset: 0 } }]
    // Otherwise, get the last offset
    const { offset } = lastState.state
    // Get next batch of results starting from the offset
    const boundWitnessDiviner = await this.getBoundWitnessDivinerForStore()
    const query = new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema })
      .fields({ limit: this.payloadDivinerLimit, offset, order, payload_schemas: this.payload_schemas })
      .build()
    const batch = await boundWitnessDiviner.divine([query])
    if (batch.length === 0) return [lastState]
    // Get source data
    const sourceArchivist = await this.getArchivistForStore()
    const indexCandidates: IndexCandidate[] = (
      await Promise.all(batch.filter(isBoundWitness).map((bw) => this.getPayloadsInBoundWitness(bw, sourceArchivist)))
    )
      .filter(exists)
      .flat()
    const nextState = { schema: ModuleStateSchema, state: { ...lastState.state, offset: offset + batch.length } }
    return [nextState, ...indexCandidates]
  }
  /**
   * Retrieves the archivist for the payloadStore
   * @returns The archivist for the payloadStore
   */
  protected async getArchivistForStore() {
    const name: string = assertEx(this.config?.payloadStore?.archivist, () => `${moduleName}: Config for payloadStore.archivist not specified`)
    const mod = assertEx(await this.resolve(name), () => `${moduleName}: Failed to resolve payloadStore.archivist`)
    return ArchivistWrapper.wrap(mod, this.account)
  }

  /**
   * Retrieves the BoundWitness Diviner for the payloadStore
   * @returns The BoundWitness Diviner for the payloadStore
   */
  protected async getBoundWitnessDivinerForStore() {
    const name: string = assertEx(
      this.config?.payloadStore?.boundWitnessDiviner,
      () => `${moduleName}: Config for payloadStore.boundWitnessDiviner not specified`,
    )
    const mod = assertEx(await this.resolve(name), () => `${moduleName}: Failed to resolve payloadStore.boundWitnessDiviner`)
    return DivinerWrapper.wrap(mod, this.account)
  }

  protected async getPayloadsInBoundWitness(bw: BoundWitness, archivist: ArchivistInstance): Promise<IndexCandidate[] | undefined> {
    const indexes = this.payload_schemas.map((schema) => bw.payload_schemas?.findIndex((s) => s === schema))
    const hashes = indexes.map((index) => bw.payload_hashes?.[index])
    const results = await archivist.get(hashes)
    const indexCandidateIdentityFunctions = this.payload_schemas.map(isPayloadOfSchemaType)
    const filteredResults = indexCandidateIdentityFunctions.map((is) => results.find(is))
    if (filteredResults.some((f) => f === undefined)) return undefined
    const indexCandidates: IndexCandidate[] = filteredResults.filter(exists) as IndexCandidate[]
    return [bw, ...indexCandidates]
  }
}
