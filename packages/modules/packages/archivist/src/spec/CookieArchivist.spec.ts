/**
 * @jest-environment jsdom
 */

import { HDWallet } from '@xyo-network/account'

import { CookieArchivist, CookieArchivistConfigSchema } from '../CookieArchivist'
import { testArchivistAll, testArchivistRoundTrip } from './testArchivist.spec'

testArchivistRoundTrip(
  (async () =>
    await CookieArchivist.create({ account: await HDWallet.random(), config: { namespace: 'test', schema: CookieArchivistConfigSchema } }))(),
  'cookie',
)
testArchivistAll(
  (async () => CookieArchivist.create({ account: await HDWallet.random(), config: { namespace: 'test', schema: CookieArchivistConfigSchema } }))(),
  'cookie',
)
