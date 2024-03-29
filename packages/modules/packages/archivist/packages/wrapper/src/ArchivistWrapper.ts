import { Hash } from '@xylabs/hex'
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
  ArchivistModule,
  ArchivistNextOptions,
  ArchivistNextQuery,
  ArchivistNextQuerySchema,
  AttachableArchivistInstance,
  isArchivistInstance,
  isArchivistModule,
} from '@xyo-network/archivist-model'
import { constructableModuleWrapper, ModuleWrapper } from '@xyo-network/module-wrapper'
import { Payload, PayloadWithMeta } from '@xyo-network/payload-model'

constructableModuleWrapper()
export class ArchivistWrapper<TWrappedModule extends ArchivistModule = ArchivistModule>
  extends ModuleWrapper<TWrappedModule>
  implements AttachableArchivistInstance<ArchivistModule['params']>
{
  static override instanceIdentityCheck = isArchivistInstance
  static override moduleIdentityCheck = isArchivistModule
  static override requiredQueries = [ArchivistGetQuerySchema, ...super.requiredQueries]

  async all(): Promise<PayloadWithMeta[]> {
    const queryPayload: ArchivistAllQuery = { schema: ArchivistAllQuerySchema }
    return await this.sendQuery(queryPayload)
  }

  async clear(): Promise<void> {
    const queryPayload: ArchivistClearQuery = { schema: ArchivistClearQuerySchema }
    await this.sendQuery(queryPayload)
  }

  async commit(): Promise<PayloadWithMeta[]> {
    const queryPayload: ArchivistCommitQuery = { schema: ArchivistCommitQuerySchema }
    return await this.sendQuery(queryPayload)
  }

  async delete(hashes: Hash[]) {
    const queryPayload: ArchivistDeleteQuery = { hashes, schema: ArchivistDeleteQuerySchema }
    await this.sendQuery(queryPayload)
    return hashes
  }

  async get(hashes: Hash[]): Promise<PayloadWithMeta[]> {
    const queryPayload: ArchivistGetQuery = { hashes, schema: ArchivistGetQuerySchema }
    return await this.sendQuery(queryPayload)
  }

  async insert(payloads: Payload[]): Promise<PayloadWithMeta[]> {
    const queryPayload: ArchivistInsertQuery = {
      schema: ArchivistInsertQuerySchema,
    }
    return await this.sendQuery(queryPayload, payloads)
  }

  async next(options?: ArchivistNextOptions): Promise<PayloadWithMeta[]> {
    const queryPayload: ArchivistNextQuery = { ...options, schema: ArchivistNextQuerySchema }
    return await this.sendQuery(queryPayload)
  }
}
