import { assertEx } from '@xylabs/assert'
import { fulfilled } from '@xylabs/promise'
import { Account } from '@xyo-network/account'
import {
  AnyConfigSchema,
  ModuleConfig,
  ModuleErrorBuilder,
  ModuleQueryResult,
  QueryBoundWitness,
  QueryBoundWitnessWrapper,
} from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { WitnessWrapper } from '@xyo-network/witness'
import compact from 'lodash/compact'

import { AbstractSentinel } from './AbstractSentinel'
import { SentinelConfig, SentinelConfigSchema } from './Config'
import { SentinelQuery, SentinelReportQuerySchema } from './Queries'
import { SentinelModule, SentinelModuleEventData, SentinelParams } from './SentinelModel'

export type MemorySentinelParams<TConfig extends AnyConfigSchema<SentinelConfig> = AnyConfigSchema<SentinelConfig>> = SentinelParams<
  AnyConfigSchema<TConfig>
>

export class MemorySentinel<
    TParams extends MemorySentinelParams = MemorySentinelParams,
    TEventData extends SentinelModuleEventData = SentinelModuleEventData,
  >
  extends AbstractSentinel<TParams, TEventData>
  implements SentinelModule<TParams, TEventData>
{
  static override configSchema = SentinelConfigSchema

  async report(payloads: Payload[] = []): Promise<Payload[]> {
    const errors: Error[] = []
    await this.emit('reportStart', { inPayloads: payloads, module: this as SentinelModule })
    const allWitnesses = [...(await this.getWitnesses())]
    const resultPayloads: Payload[] = []

    try {
      const generatedPayloads = compact(await this.generatePayloads(allWitnesses))
      const combinedPayloads = [...generatedPayloads, ...payloads]
      resultPayloads.push(...combinedPayloads)
    } catch (e) {
      errors.push(e as Error)
    }

    const [boundWitness] = await this.bindQueryResult({ schema: SentinelReportQuerySchema }, resultPayloads)
    this.history.push(assertEx(boundWitness))
    await this.emit('reportEnd', { boundWitness, errors, inPayloads: payloads, module: this as SentinelModule, outPayloads: resultPayloads })
    return [boundWitness, ...resultPayloads]
  }

  protected override async queryHandler<T extends QueryBoundWitness = QueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryResult> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<SentinelQuery>(query, payloads)
    const queryPayload = await wrapper.getQuery()
    assertEx(this.queryable(query, payloads, queryConfig))
    const queryAccount = new Account()
    const resultPayloads: Payload[] = []
    try {
      switch (queryPayload.schema) {
        case SentinelReportQuerySchema: {
          resultPayloads.push(...(await this.report(payloads)))
          break
        }
        default:
          return super.queryHandler(query, payloads)
      }
    } catch (ex) {
      const error = ex as Error
      resultPayloads.push(
        new ModuleErrorBuilder()
          .sources([await wrapper.hashAsync()])
          .message(error.message)
          .build(),
      )
    }
    return await this.bindQueryResult(queryPayload, resultPayloads, [queryAccount])
  }

  private async generatePayloads(witnesses: WitnessWrapper[]): Promise<Payload[]> {
    return (await Promise.allSettled(witnesses?.map((witness) => witness.observe())))
      .filter(fulfilled)
      .map((result) => result.value)
      .flat()
  }
}
