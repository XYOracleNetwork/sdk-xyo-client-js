/**
 * @jest-environment jsdom
 */

import { testArchivistAll, testArchivistRoundTrip } from './test.spec.test'
import { XyoCookieArchivist } from './XyoCookieArchivist'

testArchivistRoundTrip(new XyoCookieArchivist({ namespace: 'test' }), 'cookie')
testArchivistAll(new XyoCookieArchivist({ namespace: 'test' }), 'cookie')
