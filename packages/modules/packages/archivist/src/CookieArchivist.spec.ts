/**
 * @jest-environment jsdom
 */

import { CookieArchivist, CookieArchivistConfigSchema } from './CookieArchivist'
import { testArchivistAll, testArchivistRoundTrip } from './test.spec.test'

testArchivistRoundTrip(CookieArchivist.create({ config: { namespace: 'test', schema: CookieArchivistConfigSchema } }), 'cookie')
testArchivistAll(CookieArchivist.create({ config: { namespace: 'test', schema: CookieArchivistConfigSchema } }), 'cookie')
