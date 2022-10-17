/**
 * @jest-environment jsdom
 */

import { testArchivistAll, testArchivistRoundTrip } from './test.spec.test'
import { XyoCookieArchivist, XyoCookieArchivistConfig, XyoCookieArchivistConfigSchema } from './XyoCookieArchivist'

testArchivistRoundTrip(
  XyoCookieArchivist.create({ config: { namespace: 'test', schema: XyoCookieArchivistConfigSchema } as XyoCookieArchivistConfig }),
  'cookie',
)
testArchivistAll(
  XyoCookieArchivist.create({ config: { namespace: 'test', schema: XyoCookieArchivistConfigSchema } as XyoCookieArchivistConfig }),
  'cookie',
)
