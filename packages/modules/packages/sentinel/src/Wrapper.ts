import { constructableModuleWrapper, ModuleWrapper } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { SentinelReportQuery, SentinelReportQuerySchema } from './Queries'
import { SentinelModule } from './SentinelModel'

constructableModuleWrapper()
export class SentinelWrapper<TModule extends SentinelModule = SentinelModule> extends ModuleWrapper<TModule> implements SentinelModule {
  static override requiredQueries = [SentinelReportQuerySchema, ...super.requiredQueries]

  async report(payloads?: Payload[]): Promise<Payload[]> {
    const queryPayload = PayloadWrapper.parse({ schema: SentinelReportQuerySchema }) as PayloadWrapper<SentinelReportQuery>
    const result = await this.sendQuery(queryPayload, payloads)
    return result
  }
}
