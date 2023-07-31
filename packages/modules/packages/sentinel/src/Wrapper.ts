import { constructableModuleWrapper, ModuleWrapper } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'

import { SentinelInstance, SentinelModule, SentinelReportQuery, SentinelReportQuerySchema } from './model'
import { isSentinelInstance, isSentinelModule } from './typeChecks'

constructableModuleWrapper()
export class SentinelWrapper<TModule extends SentinelModule = SentinelModule>
  extends ModuleWrapper<TModule>
  implements SentinelInstance<TModule['params']>
{
  static override instanceIdentityCheck = isSentinelInstance
  static override moduleIdentityCheck = isSentinelModule
  static override requiredQueries = [SentinelReportQuerySchema, ...super.requiredQueries]

  async report(payloads?: Payload[]): Promise<Payload[]> {
    const queryPayload: SentinelReportQuery = { schema: SentinelReportQuerySchema }
    const result = await this.sendQuery(queryPayload, payloads)
    return result
  }
}
