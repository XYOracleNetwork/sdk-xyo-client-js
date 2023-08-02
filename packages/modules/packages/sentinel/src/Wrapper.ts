import { ArchivistInstance } from '@xyo-network/archivist'
import { constructableModuleWrapper, ModuleWrapper } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import {
  isSentinelInstance,
  isSentinelModule,
  SentinelInstance,
  SentinelModule,
  SentinelReportQuery,
  SentinelReportQuerySchema,
} from '@xyo-network/sentinel-model'
import { WitnessInstance } from '@xyo-network/witness'

constructableModuleWrapper()
export class SentinelWrapper<TModule extends SentinelModule = SentinelModule>
  extends ModuleWrapper<TModule>
  implements SentinelInstance<TModule['params']>
{
  static override instanceIdentityCheck = isSentinelInstance
  static override moduleIdentityCheck = isSentinelModule
  static override requiredQueries = [SentinelReportQuerySchema, ...super.requiredQueries]

  archivists(): Promise<ArchivistInstance[]> {
    throw Error('Not supported')
  }

  async report(payloads?: Payload[]): Promise<Payload[]> {
    const queryPayload: SentinelReportQuery = { schema: SentinelReportQuerySchema }
    const result = await this.sendQuery(queryPayload, payloads)
    return result
  }

  witnesses(): Promise<WitnessInstance[]> {
    throw Error('Not supported')
  }
}
