import { assertEx } from '@xylabs/assert'
import { AbstractArchivingModule, asArchivistInstance } from '@xyo-network/archivist'
import { QueryBoundWitness, QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-builder'
import { BoundWitness, isBoundWitness, notBoundWitness } from '@xyo-network/boundwitness-model'
import { ModuleConfig, ModuleQueryHandlerResult } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import {
  CustomSentinelInstance,
  SentinelInstance,
  SentinelModuleEventData,
  SentinelParams,
  SentinelQueryBase,
  SentinelReportQuerySchema,
} from '@xyo-network/sentinel-model'
import { isWitnessInstance, WitnessInstance } from '@xyo-network/witness'
import uniq from 'lodash/uniq'

export abstract class AbstractSentinel<
    TParams extends SentinelParams = SentinelParams,
    TEventData extends SentinelModuleEventData<SentinelInstance<TParams>> = SentinelModuleEventData<SentinelInstance<TParams>>,
  >
  extends AbstractArchivingModule<TParams, TEventData>
  implements CustomSentinelInstance<TParams, TEventData>
{
  history: BoundWitness[] = []

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
  }

  addWitness(address: string[]) {
    this.config.witnesses = uniq([...address, ...(this.config.witnesses ?? [])])
  }

  async archivists() {
    this.logger?.debug(`archivists:config:archivist: ${this.config?.archivists?.length}`)
    const namesOrAddresses = this.config?.archivists
      ? Array.isArray(this.config.archivists)
        ? this.config?.archivists
        : [this.config.archivists]
      : undefined
    this.logger?.debug(`archivist:namesOrAddresses: ${namesOrAddresses?.length}`)
    const result = [
      ...(await this.resolve(namesOrAddresses ? { address: namesOrAddresses } : undefined)),
      ...(await this.resolve(namesOrAddresses ? { name: namesOrAddresses } : undefined)),
    ].map((module) => assertEx(asArchivistInstance(module), 'Tried to resolve a non-archivist as an archivist'))

    if (namesOrAddresses && namesOrAddresses.length !== result.length) {
      this.logger?.warn(`Not all archivists found [Requested: ${namesOrAddresses.length}, Found: ${result.length}]`)
    }

    this.logger?.debug(`archivists:result: ${result?.length}`)

    return result
  }

  removeArchivist(address: string[]) {
    this.config.archivists = (this.config.archivists ?? []).filter((archivist) => !address.includes(archivist))
  }

  removeWitness(address: string[]) {
    this.config.witnesses = (this.config.witnesses ?? []).filter((witness) => !address.includes(witness))
  }

  async report(inPayloads?: Payload[]): Promise<Payload[]> {
    this._noOverride('report')
    await this.emit('reportStart', { inPayloads, module: this })
    const payloads = await this.reportHandler(inPayloads)
    this.logger?.debug(`report:payloads: ${JSON.stringify(payloads, null, 2)}`)
    const outPayloads = payloads.filter(notBoundWitness)
    const boundwitnesses = payloads.filter(isBoundWitness)
    const boundwitness = boundwitnesses.find((bw) => bw.addresses.includes(this.address))
    await this.emit('reportEnd', { boundwitness, inPayloads, module: this, outPayloads })
    return payloads
  }

  async witnesses() {
    this.logger?.debug(`witnesses:config:witnesses: ${this.config?.witnesses?.length}`)
    const namesOrAddresses = this.config?.witnesses
      ? Array.isArray(this.config.witnesses)
        ? this.config?.witnesses
        : [this.config.witnesses]
      : undefined
    this.logger?.debug(`witnesses:namesOrAddresses: ${namesOrAddresses?.length}`)
    const result = namesOrAddresses
      ? [
          ...(await this.resolve<WitnessInstance>({ address: namesOrAddresses }, { identity: isWitnessInstance })),
          ...(await this.resolve<WitnessInstance>({ name: namesOrAddresses }, { identity: isWitnessInstance })),
        ]
      : await this.resolve<WitnessInstance>(undefined, { identity: isWitnessInstance })

    if (namesOrAddresses && namesOrAddresses.length !== result.length) {
      this.logger?.warn(`Not all witnesses found [Requested: ${namesOrAddresses.length}, Found: ${result.length}]`)
    }
    result.map((item) => {
      this.logger?.debug(`witnesses:result: ${item.config.schema}`)
    })

    return result
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
