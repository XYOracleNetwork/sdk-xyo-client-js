import type { Hash, Promisable } from '@xylabs/sdk-js'
import type { AccountInstance } from '@xyo-network/account-model'
import type { ModuleQueryResult } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

import type { ArchivistNextOptions } from './NextOptions.ts'

export interface ArchivistRawQueryFunctions {
  allQuery(account?: AccountInstance): Promisable<ModuleQueryResult>
  clearQuery(account?: AccountInstance): Promisable<ModuleQueryResult>
  commitQuery(account?: AccountInstance): Promisable<ModuleQueryResult>
  deleteQuery(hashes: Hash[], account?: AccountInstance): Promisable<ModuleQueryResult>
  getQuery(hashes: Hash[], account?: AccountInstance): Promisable<ModuleQueryResult>
  insertQuery(payloads: Payload[], account?: AccountInstance): Promisable<ModuleQueryResult>
  nextQuery(options?: ArchivistNextOptions, account?: AccountInstance): Promisable<ModuleQueryResult>
}
