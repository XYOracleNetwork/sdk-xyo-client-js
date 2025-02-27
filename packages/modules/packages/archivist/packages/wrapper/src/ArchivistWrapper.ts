import { Hash } from '@xylabs/hex'
import { AccountInstance } from '@xyo-network/account-model'
import {
  ArchivistAllQuery,
  ArchivistAllQuerySchema,
  ArchivistClearQuery,
  ArchivistClearQuerySchema,
  ArchivistCommitQuery,
  ArchivistCommitQuerySchema,
  ArchivistDeleteQuery,
  ArchivistDeleteQuerySchema,
  ArchivistGetQuery,
  ArchivistGetQuerySchema,
  ArchivistInsertQuery,
  ArchivistInsertQuerySchema,
  ArchivistModuleInstance,
  ArchivistNextOptions,
  ArchivistNextQuery,
  ArchivistNextQuerySchema,
  AttachableArchivistInstance,
  isArchivistInstance,
  isArchivistModule,
} from '@xyo-network/archivist-model'
import { ModuleQueryResult } from '@xyo-network/module-model'
import { constructableModuleWrapper, ModuleWrapper } from '@xyo-network/module-wrapper'
import { Payload, WithStorageMeta } from '@xyo-network/payload-model'

constructableModuleWrapper()
export class ArchivistWrapper<TWrappedModule extends ArchivistModuleInstance = ArchivistModuleInstance>
  extends ModuleWrapper<TWrappedModule>
  implements AttachableArchivistInstance<ArchivistModuleInstance['params']> {
  static override readonly instanceIdentityCheck = isArchivistInstance
  static override readonly moduleIdentityCheck = isArchivistModule
  static override readonly requiredQueries = [ArchivistGetQuerySchema, ...super.requiredQueries]

  async all(): Promise<WithStorageMeta<Payload>[]> {
    const queryPayload: ArchivistAllQuery = { schema: ArchivistAllQuerySchema }
    return await this.sendQuery(queryPayload)
  }

  async allQuery(account?: AccountInstance): Promise<ModuleQueryResult> {
    const queryPayload: ArchivistAllQuery = { schema: ArchivistAllQuerySchema }
    return await this.sendQueryRaw(queryPayload, undefined, account)
  }

  async clear(): Promise<void> {
    const queryPayload: ArchivistClearQuery = { schema: ArchivistClearQuerySchema }
    await this.sendQuery(queryPayload)
  }

  async clearQuery(account?: AccountInstance): Promise<ModuleQueryResult> {
    const queryPayload: ArchivistClearQuery = { schema: ArchivistClearQuerySchema }
    return await this.sendQueryRaw(queryPayload, undefined, account)
  }

  async commit(): Promise<Payload[]> {
    const queryPayload: ArchivistCommitQuery = { schema: ArchivistCommitQuerySchema }
    return await this.sendQuery(queryPayload)
  }

  async commitQuery(account?: AccountInstance): Promise<ModuleQueryResult> {
    const queryPayload: ArchivistCommitQuery = { schema: ArchivistCommitQuerySchema }
    return await this.sendQueryRaw(queryPayload, undefined, account)
  }

  async delete(hashes: Hash[]) {
    const queryPayload: ArchivistDeleteQuery = { hashes, schema: ArchivistDeleteQuerySchema }
    await this.sendQuery(queryPayload)
    return hashes
  }

  async deleteQuery(hashes: Hash[], account?: AccountInstance): Promise<ModuleQueryResult> {
    const queryPayload: ArchivistDeleteQuery = { hashes, schema: ArchivistDeleteQuerySchema }
    return await this.sendQueryRaw(queryPayload, undefined, account)
  }

  async get(hashes: Hash[]): Promise<WithStorageMeta<Payload>[]> {
    const queryPayload: ArchivistGetQuery = { hashes, schema: ArchivistGetQuerySchema }
    return await this.sendQuery(queryPayload)
  }

  async getQuery(hashes: Hash[], account?: AccountInstance): Promise<ModuleQueryResult> {
    const queryPayload: ArchivistGetQuery = { hashes, schema: ArchivistGetQuerySchema }
    return await this.sendQueryRaw(queryPayload, undefined, account)
  }

  async insert(payloads: Payload[]): Promise<WithStorageMeta<Payload>[]> {
    const queryPayload: ArchivistInsertQuery = { schema: ArchivistInsertQuerySchema }
    return await this.sendQuery(queryPayload, payloads)
  }

  async insertQuery(payloads: Payload[], account?: AccountInstance): Promise<ModuleQueryResult> {
    const queryPayload: ArchivistInsertQuery = { schema: ArchivistInsertQuerySchema }
    return await this.sendQueryRaw(queryPayload, payloads, account)
  }

  async next(options?: ArchivistNextOptions): Promise<WithStorageMeta<Payload>[]> {
    const queryPayload: ArchivistNextQuery = { ...options, schema: ArchivistNextQuerySchema }
    return await this.sendQuery(queryPayload)
  }

  async nextQuery(options?: ArchivistNextOptions, account?: AccountInstance): Promise<ModuleQueryResult> {
    const queryPayload: ArchivistNextQuery = { schema: ArchivistNextQuerySchema, ...options }
    return await this.sendQueryRaw(queryPayload, undefined, account)
  }
}
