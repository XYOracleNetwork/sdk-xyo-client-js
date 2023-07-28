import { assertEx } from '@xylabs/assert'
import { AbstractArchivingModule, ArchivistInstance, asArchivistInstance } from '@xyo-network/archivist'
import { QueryBoundWitness, QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-builder'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { AnyConfigSchema, ModuleConfig, ModuleQueryHandlerResult } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { isWitnessInstance, WitnessInstance } from '@xyo-network/witness'
import uniq from 'lodash/uniq'

import { SentinelConfig, SentinelConfigSchema } from './Config'
import { SentinelQueryBase, SentinelReportQuerySchema } from './Queries'
import { SentinelInstance, SentinelModuleEventData, SentinelParams } from './SentinelModel'

export abstract class AbstractSentinel<
    TParams extends SentinelParams<AnyConfigSchema<SentinelConfig>> = SentinelParams<SentinelConfig>,
    TEventData extends SentinelModuleEventData = SentinelModuleEventData,
  >
  extends AbstractArchivingModule<TParams, TEventData>
  implements SentinelInstance<TParams, TEventData>
{
  static override readonly configSchemas: string[] = [SentinelConfigSchema]

  history: BoundWitness[] = []

  private _archivists: ArchivistInstance[] | undefined
  private _witnesses: WitnessInstance[] | undefined

  override get queries(): string[] {
    return [SentinelReportQuerySchema, ...super.queries]
  }

  protected override get _queryAccountPaths(): Record<SentinelQueryBase['schema'], string> {
    return {
      'network.xyo.query.sentinel.report': '1/1',
    }
  }

  addArchivist(address: string[]) {
    this.config.archivists = uniq([...address, ...(this.config.archivists ?? [])])
    this._archivists = undefined
  }

  addWitness(address: string[]) {
    this.config.witnesses = uniq([...address, ...(this.config.witnesses ?? [])])
    this._witnesses = undefined
  }

  async getArchivists() {
    const addresses = this.config?.archivists ? (Array.isArray(this.config.archivists) ? this.config?.archivists : [this.config.archivists]) : []
    this._archivists =
      this._archivists ??
      (await this.resolve({ address: addresses })).map((module) =>
        assertEx(asArchivistInstance(module), 'Tried to resolve a non-archivist as an archivist'),
      )
    if (addresses.length !== this._archivists.length) {
      this.logger?.warn(`Not all archivists found [Requested: ${addresses.length}, Found: ${this._archivists.length}]`)
    }

    return this._archivists
  }

  async getWitnesses() {
    const addresses = this.config?.witnesses ? (Array.isArray(this.config.witnesses) ? this.config?.witnesses : [this.config.witnesses]) : []
    this._witnesses = this._witnesses ?? ((await this.resolve({ address: addresses }, { identity: isWitnessInstance })) as WitnessInstance[])

    if (addresses.length !== this._witnesses.length) {
      this.logger?.warn(`Not all witnesses found [Requested: ${addresses.length}, Found: ${this._witnesses.length}]`)
    }

    return this._witnesses
  }

  removeArchivist(address: string[]) {
    this.config.archivists = (this.config.archivists ?? []).filter((archivist) => !address.includes(archivist))
    this._archivists = undefined
  }

  removeWitness(address: string[]) {
    this.config.witnesses = (this.config.witnesses ?? []).filter((witness) => !address.includes(witness))
    this._witnesses = undefined
  }

  async report(inPayloads?: Payload[]): Promise<Payload[]> {
    await this.emit('reportStart', { inPayloads, module: this })
    const outPayloads = await this.reportHandler(inPayloads)
    await this.emit('reportEnd', { inPayloads, module: this, outPayloads })
    return outPayloads
  }

  protected override async queryHandler<T extends QueryBoundWitness = QueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryHandlerResult> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<SentinelQueryBase>(query, payloads)
    const queryPayload = await wrapper.getQuery()
    assertEx(this.queryable(query, payloads, queryConfig))
    const resultPayloads: Payload[] = []
    switch (queryPayload.schema) {
      case SentinelReportQuerySchema: {
        resultPayloads.push(...(await this.report(payloads)))
        break
      }
      default: {
        return super.queryHandler(query, payloads)
      }
    }
    return resultPayloads
  }

  abstract reportHandler(payloads?: Payload[]): Promise<Payload[]>
}
