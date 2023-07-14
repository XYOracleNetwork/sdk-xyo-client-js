/**
 * @jest-environment jsdom
 */

// Augments window with necessary prototypes to ensure instance of comparisons work
// eslint-disable-next-line import/no-internal-modules
import 'fake-indexeddb/auto'

import { Account } from '@xyo-network/account'
import { ArchivistInstance } from '@xyo-network/archivist-model'
import { CreatableModule } from '@xyo-network/module'
import { IDBFactory } from 'fake-indexeddb'

import { IndexedDbArchivist, IndexedDbArchivistConfigSchema } from '../IndexedDbArchivist'
import { IndexedDbArchivistSimple, IndexedDbArchivistSimpleConfigSchema } from '../IndexedDbArchivistSimple'
import { testArchivistAll, testArchivistClear, testArchivistDelete, testArchivistRoundTrip } from './testArchivist'

// Shim via fake-indexeddb
const freshInstance = new IDBFactory()
window.indexedDB = freshInstance

type TestCase = [CreatableModule<ArchivistInstance>, string]

const testCases: TestCase[] = [
  [IndexedDbArchivistSimple, IndexedDbArchivistSimpleConfigSchema],
  [IndexedDbArchivist, IndexedDbArchivistConfigSchema],
]

describe.each(testCases)('Using IndexedDB from window', (IDbCreate, schema) => {
  beforeEach(async () => {
    const archivist = await IDbCreate.create({ account, config: { schema } })
    await archivist?.clear?.()
  })
  const account = Account.randomSync()
  const name = 'IndexedDB (window)'
  testArchivistAll(IDbCreate.create({ account, config: { schema } }) as unknown as Promise<ArchivistInstance>, name)
  testArchivistClear(IDbCreate.create({ account, config: { schema } }) as unknown as Promise<ArchivistInstance>, name)
  testArchivistDelete(IDbCreate.create({ account, config: { schema } }) as unknown as Promise<ArchivistInstance>, name)
  testArchivistRoundTrip(IDbCreate.create({ account, config: { schema } }) as unknown as Promise<ArchivistInstance>, name)
})
