import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { ModuleWrapper } from '@xyo-network/module'
import { Module } from '@xyo-network/module-model'
import { XyoPayload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { SentinelReportQuery, SentinelReportQuerySchema } from './Queries'
import { Sentinel, SentinelModule } from './SentinelModel'

export class SentinelWrapper extends ModuleWrapper implements Sentinel {
  static override requiredQueries = [SentinelReportQuerySchema, ...super.requiredQueries]

  constructor(module: Module, account?: Account) {
    super(module, account)
    assertEx(module.queries.includes(SentinelReportQuerySchema))
  }

  static override tryWrap(module?: Module, account?: Account): SentinelWrapper | undefined {
    if (module) {
      const missingRequiredQueries = this.missingRequiredQueries(module)
      if (missingRequiredQueries.length > 0) {
        console.warn(`Missing queries: ${JSON.stringify(missingRequiredQueries, null, 2)}`)
      } else {
        return new SentinelWrapper(module as SentinelModule, account)
      }
    }
  }

  static override wrap(module?: Module, account?: Account): SentinelWrapper {
    return assertEx(this.tryWrap(module, account), 'Unable to wrap module as DivinerWrapper')
  }

  async report(payloads?: XyoPayload[]): Promise<XyoPayload[]> {
    const queryPayload = PayloadWrapper.parse<SentinelReportQuery>({ schema: SentinelReportQuerySchema })
    const result = await this.sendQuery(queryPayload, payloads)
    return result
  }
}
