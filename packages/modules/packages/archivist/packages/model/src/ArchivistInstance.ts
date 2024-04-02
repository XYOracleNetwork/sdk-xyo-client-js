import { Hash } from '@xylabs/hex'
import { Promisable } from '@xylabs/promise'
import { AccountInstance } from '@xyo-network/account-model'
import { ModuleInstance, ModuleQueryResult } from '@xyo-network/module-model'
import { Payload, WithMeta } from '@xyo-network/payload-model'

import { ArchivistModule, ArchivistModuleEventData, ArchivistNextOptions, ArchivistQueryFunctions } from './Archivist'
import { ArchivistParams } from './Params'

export interface ArchivistInstance<
  TParams extends ArchivistParams = ArchivistParams,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
  TPayload extends Payload = Payload,
> extends ArchivistModule<TParams, TEventData>,
    ArchivistQueryFunctions<TPayload, WithMeta<TPayload>>,
    ModuleInstance<TParams, TEventData> {
  allQuery(account: AccountInstance): Promisable<ModuleQueryResult>
  clearQuery(account: AccountInstance): Promisable<ModuleQueryResult>
  commitQuery(account: AccountInstance): Promisable<ModuleQueryResult>
  deleteQuery(account: AccountInstance, hashes: Hash[]): Promisable<ModuleQueryResult>
  getQuery(account: AccountInstance, hashes: Hash[]): Promisable<ModuleQueryResult>
  insertQuery(account: AccountInstance, payloads: Payload[]): Promisable<ModuleQueryResult>
  nextQuery(account: AccountInstance, options?: ArchivistNextOptions): Promisable<ModuleQueryResult>
}
