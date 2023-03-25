import { assertEx } from '@xylabs/assert'
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
  static override configSchema: SentinelConfigSchema

  override async query<T extends QueryBoundWitness = QueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryResult> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<SentinelQuery>(query, payloads)
    const typedQuery = wrapper.query
    assertEx(this.queryable(query, payloads, queryConfig))
    const queryAccount = new Account()
    const resultPayloads: Payload[] = []
    try {
      switch (typedQuery.schemaName) {
        case SentinelReportQuerySchema: {
          resultPayloads.push(...(await this.report(payloads)))
          break
        }
        default:
          return super.query(query, payloads)
      }
    } catch (ex) {
      const error = ex as Error
      resultPayloads.push(new ModuleErrorBuilder([wrapper.hash], error.message).build())
    }
    return await this.bindResult(resultPayloads, queryAccount)
  }

  async report(payloads: Payload[] = []): Promise<Payload[]> {
    const errors: Error[] = []
    await this.emit('reportStart', { inPayloads: payloads, module: this as SentinelModule })
    const allWitnesses = [...(await this.getWitnesses())]
    const allPayloads: Payload[] = []

    try {
      const generatedPayloads = compact(await this.generatePayloads(allWitnesses))
      const combinedPayloads = [...generatedPayloads, ...payloads]
      allPayloads.push(...combinedPayloads)
    } catch (e) {
      errors.push(e as Error)
    }

    const [boundWitness] = await this.bindResult(allPayloads)
    this.history.push(assertEx(boundWitness))
    await this.emit('reportEnd', { boundWitness, errors, inPayloads: payloads, module: this as SentinelModule, outPayloads: allPayloads })
    return [boundWitness, ...allPayloads]
  }

  private async generatePayloads(witnesses: WitnessWrapper[]): Promise<Payload[]> {
    return (await Promise.all(witnesses?.map(async (witness) => await witness.observe()))).flat()
  }
}
