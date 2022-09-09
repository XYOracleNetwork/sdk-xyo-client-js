/**
 * @jest-environment jsdom
 */

import { testArchivist } from './test'
import { XyoCookieArchivist } from './XyoCookieArchivist'

testArchivist(new XyoCookieArchivist(), 'cookie')
