/**
 * @jest-environment jsdom
 */

import { testArchivistAll, testArchivistRoundTrip } from './test.spec.test'
import { XyoCookieArchivist, XyoCookieArchivistConfigSchema } from './XyoCookieArchivist'

testArchivistRoundTrip(XyoCookieArchivist.create({ config: { namespace: 'test', schema: XyoCookieArchivistConfigSchema } }), 'cookie')
testArchivistAll(XyoCookieArchivist.create({ config: { namespace: 'test', schema: XyoCookieArchivistConfigSchema } }), 'cookie')
