import { assertEx } from '@xylabs/assert'
import { AccountInstance } from '@xyo-network/account-model'
import { ModuleWrapper } from '@xyo-network/module'
import { Module } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { SentinelReportQuery, SentinelReportQuerySchema } from './Queries'
import { SentinelModule } from './SentinelModel'

export class SentinelWrapper<TModule extends SentinelModule = SentinelModule> extends ModuleWrapper<TModule> implements SentinelModule {
  static override requiredQueries = [SentinelReportQuerySchema, ...super.requiredQueries]

  static override tryWrap(module?: Module, account?: AccountInstance): SentinelWrapper | undefined {
    if (module) {
      const missingRequiredQueries = this.missingRequiredQueries(module)
      if (missingRequiredQueries.length > 0) {
        //console.warn(`Missing queries: ${JSON.stringify(missingRequiredQueries, null, 2)}`)
      } else {
        return new SentinelWrapper({ account, module: module as SentinelModule })
      }
    }
  }

  static override wrap(module?: Module, account?: AccountInstance): SentinelWrapper {
    return assertEx(this.tryWrap(module, account), 'Unable to wrap module as DivinerWrapper')
  }

  async report(payloads?: Payload[]): Promise<Payload[]> {
    const queryPayload = PayloadWrapper.parse<SentinelReportQuery>({ schema: SentinelReportQuerySchema })
    const result = await this.sendQuery(queryPayload, payloads)
    return result
  }
}
