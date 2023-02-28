import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { AbstractArchivist, ArchivingModule } from '@xyo-network/archivist'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { ModuleConfig, ModuleParams, ModuleQueryResult, QueryBoundWitnessWrapper, XyoErrorBuilder, XyoQueryBoundWitness } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { AbstractWitness, WitnessWrapper } from '@xyo-network/witness'
import compact from 'lodash/compact'
import uniq from 'lodash/uniq'

import { SentinelConfig, SentinelConfigSchema } from './Config'
import { SentinelQuery, SentinelReportQuerySchema } from './Queries'
import { SentinelModule } from './SentinelModel'

export type AbstractSentinelConfig = SentinelConfig<{
  onReportEnd?: (boundWitness?: XyoBoundWitness, errors?: Error[]) => void
  onReportStart?: () => void
  onWitnessReportEnd?: (witness: WitnessWrapper, error?: Error) => void
  onWitnessReportStart?: (witness: WitnessWrapper) => void
  schema: SentinelConfigSchema
}>

export class AbstractSentinel<TConfig extends SentinelConfig = SentinelConfig> extends ArchivingModule<TConfig> implements SentinelModule<TConfig> {
  static override configSchema: SentinelConfigSchema

  history: XyoBoundWitness[] = []
  private _archivists: ArchivistWrapper[] | undefined
  private _witnesses: WitnessWrapper[] | undefined

  override get queries(): string[] {
    return [SentinelReportQuerySchema, ...super.queries]
  }

  static override async create(params?: Partial<ModuleParams<SentinelConfig>>): Promise<AbstractSentinel> {
    return (await super.create(params)) as AbstractSentinel
  }

  addWitness(address: string[]) {
    this.config.witnesses = uniq([...address, ...(this.config.witnesses ?? [])])
    this._witnesses = undefined
  }

  async getArchivists() {
    const addresses = this.config?.archivists ? (Array.isArray(this.config.archivists) ? this.config?.archivists : [this.config.archivists]) : []
    this._archivists =
      this._archivists || ((await this.resolve({ address: addresses })) as AbstractArchivist[]).map((witness) => new ArchivistWrapper(witness))

    return this._archivists
  }

  async getWitnesses() {
    const addresses = this.config?.witnesses ? (Array.isArray(this.config.witnesses) ? this.config?.witnesses : [this.config.witnesses]) : []
    this._witnesses =
      this._witnesses || ((await this.resolve({ address: addresses })) as AbstractWitness[]).map((witness) => new WitnessWrapper(witness))

    return this._witnesses
  }

  override async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: XyoPayload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryResult> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<SentinelQuery>(query, payloads)
    const typedQuery = wrapper.query
    assertEx(this.queryable(query, payloads, queryConfig))
    const queryAccount = new Account()
    const resultPayloads: XyoPayload[] = []
    try {
      switch (typedQuery.schemaName) {
        case SentinelReportQuerySchema: {
          const reportResult = await this.report(payloads)
          resultPayloads.push(...(reportResult[0], reportResult[1]))
          break
        }
        default:
          return super.query(query, payloads)
      }
    } catch (ex) {
      const error = ex as Error
      resultPayloads.push(new XyoErrorBuilder([wrapper.hash], error.message).build())
    }
    return await this.bindResult(resultPayloads, queryAccount)
  }

  removeArchivist(address: string[]) {
    this.config.archivists = (this.config.archivists ?? []).filter((archivist) => !address.includes(archivist))
    this._archivists = undefined
  }

  removeWitness(address: string[]) {
    this.config.witnesses = (this.config.witnesses ?? []).filter((witness) => !address.includes(witness))
    this._witnesses = undefined
  }

  async report(payloads: XyoPayload[] = []): Promise<[XyoBoundWitness, XyoPayload[]]> {
    const errors: Error[] = []
    this.config?.onReportStart?.()
    const allWitnesses = [...(await this.getWitnesses())]
    const allPayloads: XyoPayload[] = []

    try {
      const generatedPayloads = compact(await this.generatePayloads(allWitnesses))
      const combinedPayloads = [...generatedPayloads, ...payloads]
      allPayloads.push(...combinedPayloads)
    } catch (e) {
      errors.push(e as Error)
    }

    const [newBoundWitness] = await this.bindResult(allPayloads)
    this.history.push(assertEx(newBoundWitness))
    this.config?.onReportEnd?.(newBoundWitness, errors.length > 0 ? errors : undefined)
    return [newBoundWitness, allPayloads]
  }

  async tryReport(payloads: XyoPayload[] = []): Promise<[XyoBoundWitness | null, XyoPayload[]]> {
    try {
      return await this.report(payloads)
    } catch (ex) {
      const error = ex as Error
      this.logger?.warn(`report failed [${error.message}]`)
      return [null, []]
    }
  }

  private async generatePayloads(witnesses: WitnessWrapper[]): Promise<XyoPayload[]> {
    return (await Promise.all(witnesses?.map(async (witness) => await witness.observe()))).flat()
  }
}
