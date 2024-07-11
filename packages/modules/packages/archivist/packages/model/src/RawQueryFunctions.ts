import { Hash } from '@xylabs/hex'
import { Promisable } from '@xylabs/promise'
import { AccountInstance } from '@xyo-network/account-model'
import { ModuleQueryResult } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { ArchivistNextOptions } from './NextOptions.js'

export interface ArchivistRawQueryFunctions {
  allQuery(account?: AccountInstance): Promisable<ModuleQueryResult>
  clearQuery(account?: AccountInstance): Promisable<ModuleQueryResult>
  commitQuery(account?: AccountInstance): Promisable<ModuleQueryResult>
  deleteQuery(hashes: Hash[], account?: AccountInstance): Promisable<ModuleQueryResult>
  getQuery(hashes: Hash[], account?: AccountInstance): Promisable<ModuleQueryResult>
  insertQuery(payloads: Payload[], account?: AccountInstance): Promisable<ModuleQueryResult>
  nextQuery(options?: ArchivistNextOptions, account?: AccountInstance): Promisable<ModuleQueryResult>
}
