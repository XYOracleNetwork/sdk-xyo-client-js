import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { ArchivistInstance } from '@xyo-network/archivist-model'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { BoundWitness, isBoundWitnessWithMeta } from '@xyo-network/boundwitness-model'
import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import { BoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-abstract'
import { BoundWitnessDivinerParams, BoundWitnessDivinerQueryPayload, BoundWitnessDivinerQuerySchema } from '@xyo-network/diviner-boundwitness-model'
import { IndexingDivinerState } from '@xyo-network/diviner-indexing-model'
import { DivinerConfigSchema } from '@xyo-network/diviner-model'
import {
  TemporalIndexingDivinerStateToIndexCandidateDivinerConfigSchema,
  TemporalIndexingDivinerStateToIndexCandidateDivinerParams,
} from '@xyo-network/diviner-temporal-indexing-model'
import { DivinerWrapper } from '@xyo-network/diviner-wrapper'
import { isModuleState, Labels, ModuleState, ModuleStateSchema } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { intraBoundwitnessSchemaCombinations } from '@xyo-network/payload-utils'
import { TimeStamp, TimestampSchema } from '@xyo-network/witness-timestamp'

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
  static override readonly configSchema = TemporalIndexingDivinerStateToIndexCandidateDivinerConfigSchema
  static override configSchemas = [DivinerConfigSchema, TemporalIndexingDivinerStateToIndexCandidateDivinerConfigSchema]
  static labels: Labels = {
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

  protected override async divineHandler(payloads: Payload[] = []): Promise<[ModuleState, ...IndexCandidate[]]> {
    // Retrieve the last state from what was passed in
    const lastState = payloads.find(isModuleState<IndexingDivinerState>)
    // If there is no last state, start from the beginning
    if (!lastState) return [{ schema: ModuleStateSchema, state: { offset: 0 } }]
    // Otherwise, get the last offset
    const { offset } = lastState.state
    // Get next batch of results starting from the offset
    const boundWitnessDiviner = await this.getBoundWitnessDivinerForStore()
    if (!boundWitnessDiviner) return [lastState]
    const query = await new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema })
      .fields({ limit: this.payloadDivinerLimit, offset, order, payload_schemas: this.payload_schemas })
      .build()
    const batch = await boundWitnessDiviner.divine([query])
    if (batch.length === 0) return [lastState]
    // Get source data
    const sourceArchivist = await this.getArchivistForStore()
    if (!sourceArchivist) return [lastState]
    const bws = batch.filter(isBoundWitnessWithMeta)
    const indexCandidates: IndexCandidate[] = (await Promise.all(bws.map((bw) => this.getPayloadsInBoundWitness(bw, sourceArchivist))))
      .filter(exists)
      .flat()
    const nextState = { schema: ModuleStateSchema, state: { ...lastState.state, offset: offset + batch.length } }
    return [nextState, ...indexCandidates]
  }
  /**
   * Retrieves the archivist for the payloadStore
   * @returns The archivist for the payloadStore or undefined if not resolvable
   */
  protected async getArchivistForStore(): Promise<ArchivistWrapper | undefined> {
    // It should be defined, so we'll error if it's not
    const name: string = assertEx(this.config?.payloadStore?.archivist, () => `${moduleName}: Config for payloadStore.archivist not specified`)
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
  protected async getBoundWitnessDivinerForStore(): Promise<
    DivinerWrapper<BoundWitnessDiviner<BoundWitnessDivinerParams, BoundWitnessDivinerQueryPayload, BoundWitness>, BoundWitness> | undefined
  > {
    // It should be defined, so we'll error if it's not
    const name: string = assertEx(
      this.config?.payloadStore?.boundWitnessDiviner,
      () => `${moduleName}: Config for payloadStore.boundWitnessDiviner not specified`,
    )
    // It might not be resolvable (yet), so we'll return undefined if it's not
    const mod = await this.resolve(name)
    if (!mod) return undefined
    // Return the wrapped diviner
    return DivinerWrapper.wrap<
      DivinerWrapper<BoundWitnessDiviner<BoundWitnessDivinerParams, BoundWitnessDivinerQueryPayload, BoundWitness>, BoundWitness>
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
