import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import {
  AnyConfigSchema,
  ModuleConfig,
  ModuleQueryResult,
  QueryBoundWitnessWrapper,
  XyoErrorBuilder,
  XyoQueryBoundWitness,
} from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { WitnessWrapper } from '@xyo-network/witness'
import compact from 'lodash/compact'

import { AbstractSentinel } from './AbstractSentinel'
import { SentinelConfig, SentinelConfigSchema } from './Config'
import { SentinelQuery, SentinelReportQuerySchema } from './Queries'
import { SentinelModule, SentinelParams } from './SentinelModel'

export type MemorySentinelParams<TConfig extends AnyConfigSchema<SentinelConfig> = AnyConfigSchema<SentinelConfig>> = SentinelParams<
  AnyConfigSchema<TConfig>
>

export class MemorySentinel<TParams extends MemorySentinelParams = MemorySentinelParams>
  extends AbstractSentinel<TParams>
  implements SentinelModule<TParams>
{
  static override configSchema: SentinelConfigSchema

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
          resultPayloads.push(...(await this.report(payloads)))
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

  async report(payloads: XyoPayload[] = []): Promise<XyoPayload[]> {
    const errors: Error[] = []
    await this.emit('onReportStarted')
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
    await this.emit('onReportEnded', { errors, newBoundWitness })
    return [newBoundWitness, ...allPayloads]
  }

  private async generatePayloads(witnesses: WitnessWrapper[]): Promise<XyoPayload[]> {
    return (await Promise.all(witnesses?.map(async (witness) => await witness.observe()))).flat()
  }
}
