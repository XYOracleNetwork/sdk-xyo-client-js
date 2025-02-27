import { AccountInstance } from '@xyo-network/account-model'
import { ArchivistInstance } from '@xyo-network/archivist-model'
import { ModuleQueryResult } from '@xyo-network/module-model'
import { constructableModuleWrapper, ModuleWrapper } from '@xyo-network/module-wrapper'
import { Payload } from '@xyo-network/payload-model'
import {
  isSentinelInstance,
  isSentinelModule,
  SentinelInstance,
  SentinelModule,
  SentinelReportQuery,
  SentinelReportQuerySchema,
} from '@xyo-network/sentinel-model'
import { WitnessInstance } from '@xyo-network/witness-model'

constructableModuleWrapper()
export class SentinelWrapper<TModule extends SentinelModule = SentinelModule>
  extends ModuleWrapper<TModule>
  implements SentinelInstance<TModule['params']> {
  static override readonly instanceIdentityCheck = isSentinelInstance
  static override readonly moduleIdentityCheck = isSentinelModule
  static override readonly requiredQueries = [SentinelReportQuerySchema, ...super.requiredQueries]

  archivists(): Promise<ArchivistInstance[]> {
    throw new Error('Not supported')
  }

  async report(payloads?: Payload[]): Promise<Payload[]> {
    const queryPayload: SentinelReportQuery = { schema: SentinelReportQuerySchema }
    return await this.sendQuery(queryPayload, payloads)
  }

  async reportQuery(payloads?: Payload[], account?: AccountInstance): Promise<ModuleQueryResult> {
    const queryPayload: SentinelReportQuery = { schema: SentinelReportQuerySchema }
    return await this.sendQueryRaw(queryPayload, payloads, account)
  }

  witnesses(): Promise<WitnessInstance[]> {
    throw new Error('Not supported')
  }
}
