/**
 * @jest-environment jsdom
 */

import { testArchivistAll, testArchivistRoundTrip } from './test.spec.test'
import { XyoCookieArchivist, XyoCookieArchivistConfigSchema } from './XyoCookieArchivist'

testArchivistRoundTrip(new XyoCookieArchivist({ config: { namespace: 'test', schema: XyoCookieArchivistConfigSchema } }).start(), 'cookie')
testArchivistAll(new XyoCookieArchivist({ config: { namespace: 'test', schema: XyoCookieArchivistConfigSchema } }).start(), 'cookie')
