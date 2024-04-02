import { assertEx } from '@xylabs/assert'
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
  ArchivistModule,
  ArchivistNextOptions,
  ArchivistNextQuery,
  ArchivistNextQuerySchema,
  AttachableArchivistInstance,
  isArchivistInstance,
  isArchivistModule,
} from '@xyo-network/archivist-model'
import { ModuleQueryResult } from '@xyo-network/module-model'
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

  async allQuery(account: AccountInstance): Promise<ModuleQueryResult> {
    assertEx(account.address === this.account.address, () => 'Account does not match wrapper account')
    const queryPayload: ArchivistAllQuery = { schema: ArchivistAllQuerySchema }
    return (await this.sendQuery(queryPayload)) as ModuleQueryResult
  }

  async clear(): Promise<void> {
    const queryPayload: ArchivistClearQuery = { schema: ArchivistClearQuerySchema }
    await this.sendQuery(queryPayload)
  }

  async clearQuery(account: AccountInstance): Promise<ModuleQueryResult> {
    assertEx(account.address === this.account.address, () => 'Account does not match wrapper account')
    const queryPayload: ArchivistClearQuery = { schema: ArchivistClearQuerySchema }
    return (await this.sendQuery(queryPayload)) as ModuleQueryResult
  }

  async commit(): Promise<PayloadWithMeta[]> {
    const queryPayload: ArchivistCommitQuery = { schema: ArchivistCommitQuerySchema }
    return await this.sendQuery(queryPayload)
  }

  async commitQuery(account: AccountInstance): Promise<ModuleQueryResult> {
    assertEx(account.address === this.account.address, () => 'Account does not match wrapper account')
    const queryPayload: ArchivistCommitQuery = { schema: ArchivistCommitQuerySchema }
    return (await this.sendQuery(queryPayload)) as ModuleQueryResult
  }

  async delete(hashes: Hash[]) {
    const queryPayload: ArchivistDeleteQuery = { hashes, schema: ArchivistDeleteQuerySchema }
    await this.sendQuery(queryPayload)
    return hashes
  }

  async deleteQuery(account: AccountInstance, hashes: Hash[]): Promise<ModuleQueryResult> {
    assertEx(account.address === this.account.address, () => 'Account does not match wrapper account')
    const queryPayload: ArchivistDeleteQuery = { hashes, schema: ArchivistDeleteQuerySchema }
    return (await this.sendQuery(queryPayload)) as ModuleQueryResult
  }

  async get(hashes: Hash[]): Promise<PayloadWithMeta[]> {
    const queryPayload: ArchivistGetQuery = { hashes, schema: ArchivistGetQuerySchema }
    return await this.sendQuery(queryPayload)
  }

  async getQuery(account: AccountInstance, hashes: Hash[]): Promise<ModuleQueryResult> {
    assertEx(account.address === this.account.address, () => 'Account does not match wrapper account')
    const queryPayload: ArchivistGetQuery = { hashes, schema: ArchivistGetQuerySchema }
    return (await this.sendQuery(queryPayload)) as ModuleQueryResult
  }

  async insert(payloads: Payload[]): Promise<PayloadWithMeta[]> {
    const queryPayload: ArchivistInsertQuery = {
      schema: ArchivistInsertQuerySchema,
    }
    return await this.sendQuery(queryPayload, payloads)
  }

  async insertQuery(account: AccountInstance, payloads: Payload[]): Promise<ModuleQueryResult> {
    assertEx(account.address === this.account.address, () => 'Account does not match wrapper account')
    const queryPayload: ArchivistInsertQuery = { schema: ArchivistInsertQuerySchema }
    return (await this.sendQuery(queryPayload, payloads)) as ModuleQueryResult
  }

  async next(options?: ArchivistNextOptions): Promise<PayloadWithMeta[]> {
    const queryPayload: ArchivistNextQuery = { ...options, schema: ArchivistNextQuerySchema }
    return await this.sendQuery(queryPayload)
  }

  async nextQuery(account: AccountInstance, options?: ArchivistNextOptions): Promise<ModuleQueryResult> {
    assertEx(account.address === this.account.address, () => 'Account does not match wrapper account')
    const queryPayload: ArchivistNextQuery = { schema: ArchivistNextQuerySchema, ...options }
    return (await this.sendQuery(queryPayload)) as ModuleQueryResult
  }
}
