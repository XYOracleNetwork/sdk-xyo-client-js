import type { Hash } from '@xylabs/hex'
import type { AccountInstance } from '@xyo-network/account-model'
import type {
  ArchivistAllQuery,
  ArchivistClearQuery,
  ArchivistCommitQuery,
  ArchivistDeleteQuery,
  ArchivistGetQuery,
  ArchivistInsertQuery,
  ArchivistModule,
  ArchivistNextOptions,
  ArchivistNextQuery,
  AttachableArchivistInstance } from '@xyo-network/archivist-model'
import {
  ArchivistAllQuerySchema,
  ArchivistClearQuerySchema,
  ArchivistCommitQuerySchema,
  ArchivistDeleteQuerySchema,
  ArchivistGetQuerySchema,
  ArchivistInsertQuerySchema,
  ArchivistNextQuerySchema,
  isArchivistInstance,
  isArchivistModule,
} from '@xyo-network/archivist-model'
import type { ModuleQueryResult } from '@xyo-network/module-model'
import { constructableModuleWrapper, ModuleWrapper } from '@xyo-network/module-wrapper'
import type { Payload, PayloadWithMeta } from '@xyo-network/payload-model'

constructableModuleWrapper()
export class ArchivistWrapper<TWrappedModule extends ArchivistModule = ArchivistModule>
  extends ModuleWrapper<TWrappedModule>
  implements AttachableArchivistInstance<ArchivistModule['params']> {
  static override instanceIdentityCheck = isArchivistInstance
  static override moduleIdentityCheck = isArchivistModule
  static override requiredQueries = [ArchivistGetQuerySchema, ...super.requiredQueries]

  async all(): Promise<PayloadWithMeta[]> {
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

  async commit(): Promise<PayloadWithMeta[]> {
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

  async get(hashes: Hash[]): Promise<PayloadWithMeta[]> {
    const queryPayload: ArchivistGetQuery = { hashes, schema: ArchivistGetQuerySchema }
    return await this.sendQuery(queryPayload)
  }

  async getQuery(hashes: Hash[], account?: AccountInstance): Promise<ModuleQueryResult> {
    const queryPayload: ArchivistGetQuery = { hashes, schema: ArchivistGetQuerySchema }
    return await this.sendQueryRaw(queryPayload, undefined, account)
  }

  async insert(payloads: Payload[]): Promise<PayloadWithMeta[]> {
    const queryPayload: ArchivistInsertQuery = {
      schema: ArchivistInsertQuerySchema,
    }
    return await this.sendQuery(queryPayload, payloads)
  }

  async insertQuery(payloads: Payload[], account?: AccountInstance): Promise<ModuleQueryResult> {
    const queryPayload: ArchivistInsertQuery = { schema: ArchivistInsertQuerySchema }
    return await this.sendQueryRaw(queryPayload, payloads, account)
  }

  async next(options?: ArchivistNextOptions): Promise<PayloadWithMeta[]> {
    const queryPayload: ArchivistNextQuery = { ...options, schema: ArchivistNextQuerySchema }
    return await this.sendQuery(queryPayload)
  }

  async nextQuery(options?: ArchivistNextOptions, account?: AccountInstance): Promise<ModuleQueryResult> {
    const queryPayload: ArchivistNextQuery = { schema: ArchivistNextQuerySchema, ...options }
    return await this.sendQueryRaw(queryPayload, undefined, account)
  }
}
