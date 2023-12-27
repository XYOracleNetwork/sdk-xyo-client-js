/**
 * @jest-environment jsdom
 */

import { Account } from '@xyo-network/account'

import { CookieArchivist, CookieArchivistConfigSchema } from '../CookieArchivist'
import { testArchivistAll, testArchivistRoundTrip } from './testArchivist'

/**
 * @group module
 * @group archivist
 */

testArchivistRoundTrip(
  (async () => await CookieArchivist.create({ account: Account.randomSync(), config: { namespace: 'test', schema: CookieArchivistConfigSchema } }))(),
  'cookie',
)
testArchivistAll(
  (async () => await CookieArchivist.create({ account: Account.randomSync(), config: { namespace: 'test', schema: CookieArchivistConfigSchema } }))(),
  'cookie',
)
