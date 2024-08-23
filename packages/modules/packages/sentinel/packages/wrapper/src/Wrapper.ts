import type { AccountInstance } from '@xyo-network/account-model'
import type { ArchivistInstance } from '@xyo-network/archivist-model'
import type { ModuleQueryResult } from '@xyo-network/module-model'
import { constructableModuleWrapper, ModuleWrapper } from '@xyo-network/module-wrapper'
import type { Payload } from '@xyo-network/payload-model'
import type {
  SentinelInstance,
  SentinelModule,
  SentinelReportQuery,
} from '@xyo-network/sentinel-model'
import {
  isSentinelInstance,
  isSentinelModule,
  SentinelReportQuerySchema,
} from '@xyo-network/sentinel-model'
import type { WitnessInstance } from '@xyo-network/witness-model'

constructableModuleWrapper()
export class SentinelWrapper<TModule extends SentinelModule = SentinelModule>
  extends ModuleWrapper<TModule>
  implements SentinelInstance<TModule['params']> {
  static override instanceIdentityCheck = isSentinelInstance
  static override moduleIdentityCheck = isSentinelModule
  static override requiredQueries = [SentinelReportQuerySchema, ...super.requiredQueries]

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
