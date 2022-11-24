import { assertEx } from '@xylabs/assert'
import { XyoAccount } from '@xyo-network/account'
import { AbstractArchivist, ArchivistWrapper } from '@xyo-network/archivist'
import { BoundWitnessBuilder, XyoBoundWitness } from '@xyo-network/boundwitness'
import {
  ModuleQueryResult,
  QueryBoundWitnessWrapper,
  XyoErrorBuilder,
  XyoModule,
  XyoModuleConfig,
  XyoModuleParams,
  XyoQueryBoundWitness,
} from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { WitnessWrapper, XyoWitness } from '@xyo-network/witness'
import compact from 'lodash/compact'
import uniq from 'lodash/uniq'

import { PanelModule } from './Panel'
import { XyoPanelQuery, XyoPanelReportQuerySchema } from './Queries'

export type XyoPanelConfigSchema = 'network.xyo.panel.config'
export const XyoPanelConfigSchema: XyoPanelConfigSchema = 'network.xyo.panel.config'

export type XyoPanelConfig = XyoModuleConfig<{
  archivists?: string[]
  onReportEnd?: (boundWitness?: XyoBoundWitness, errors?: Error[]) => void
  onReportStart?: () => void
  onWitnessReportEnd?: (witness: WitnessWrapper, error?: Error) => void
  onWitnessReportStart?: (witness: WitnessWrapper) => void
  schema: XyoPanelConfigSchema
  witnesses?: string[]
}>

export class XyoPanel extends XyoModule<XyoPanelConfig> implements PanelModule {
  static override configSchema: XyoPanelConfigSchema

  public history: XyoBoundWitness[] = []
  private _archivists: ArchivistWrapper[] | undefined
  private _witnesses: WitnessWrapper[] | undefined

  static override async create(params?: Partial<XyoModuleParams<XyoPanelConfig>>): Promise<XyoPanel> {
    return (await super.create(params)) as XyoPanel
  }

  public addArchivist(address: string[]) {
    this.config.archivists = uniq([...address, ...(this.config.archivists ?? [])])
    this._archivists = undefined
  }

  public addWitness(address: string[]) {
    this.config.witnesses = uniq([...address, ...(this.config.witnesses ?? [])])
    this._witnesses = undefined
  }

  public async getArchivists() {
    const addresses = this.config?.archivists ? (Array.isArray(this.config.archivists) ? this.config?.archivists : [this.config.archivists]) : []
    this._archivists =
      this._archivists ||
      ((await this.resolver?.resolve({ address: addresses })) as AbstractArchivist[]).map((witness) => new ArchivistWrapper(witness))

    return this._archivists
  }

  public async getWitnesses() {
    const addresses = this.config?.witnesses ? (Array.isArray(this.config.witnesses) ? this.config?.witnesses : [this.config.witnesses]) : []
    this._witnesses =
      this._witnesses || ((await this.resolver?.resolve({ address: addresses })) as XyoWitness[]).map((witness) => new WitnessWrapper(witness))

    return this._witnesses
  }

  public override queries(): string[] {
    return [XyoPanelReportQuerySchema, ...super.queries()]
  }

  override async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(
    query: T,
    payloads?: XyoPayload[],
  ): Promise<ModuleQueryResult<XyoPayload>> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<XyoPanelQuery>(query, payloads)
    const typedQuery = wrapper.query
    assertEx(this.queryable(typedQuery.schema, wrapper.addresses))

    const queryAccount = new XyoAccount()

    const resultPayloads: XyoPayload[] = []
    try {
      switch (typedQuery.schemaName) {
        case XyoPanelReportQuerySchema: {
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

  public removeArchivist(address: string[]) {
    this.config.archivists = (this.config.archivists ?? []).filter((archivist) => !address.includes(archivist))
    this._archivists = undefined
  }

  public removeWitness(address: string[]) {
    this.config.witnesses = (this.config.witnesses ?? []).filter((witness) => !address.includes(witness))
    this._witnesses = undefined
  }

  public async report(payloads: XyoPayload[] = []): Promise<[XyoBoundWitness[], XyoPayload[]]> {
    const errors: Error[] = []
    this.config?.onReportStart?.()
    const allWitnesses = [...(await this.getWitnesses())]
    const allPayloads = [...compact(await this.generatePayloads(allWitnesses)), ...payloads]
    const [newBoundWitness] = new BoundWitnessBuilder().payloads(allPayloads).witness(this.account).build()

    const archivistBoundWitnesses = (
      await Promise.all((await this.getArchivists()).map((archivist) => archivist.insert([newBoundWitness, ...allPayloads])))
    ).flat()
    this.history.push(assertEx(newBoundWitness))
    this.config?.onReportEnd?.(newBoundWitness, errors.length > 0 ? errors : undefined)
    return [archivistBoundWitnesses, [newBoundWitness, ...payloads]]
  }

  public async tryReport(payloads: XyoPayload[] = []): Promise<[XyoBoundWitness[], XyoPayload[]]> {
    try {
      return await this.report(payloads)
    } catch (ex) {
      const error = ex as Error
      this.logger?.warn(`report failed [${error.message}]`)
      return [[], []]
    }
  }

  private async generatePayloads(witnesses: WitnessWrapper[]): Promise<XyoPayload[]> {
    return (await Promise.allSettled(witnesses?.map(async (witness) => await witness.observe())))
      .map((settled) => (settled.status === 'fulfilled' ? settled.value : []))
      .flat()
  }
}
