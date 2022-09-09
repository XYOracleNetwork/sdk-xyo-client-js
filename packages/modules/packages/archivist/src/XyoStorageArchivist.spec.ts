/**
 * @jest-environment jsdom
 */

import { testArchivist } from './test'
import { XyoStorageArchivist } from './XyoStorageArchivist'

testArchivist(new XyoStorageArchivist({ type: 'local' }), 'local')
testArchivist(new XyoStorageArchivist({ type: 'session' }), 'session')
testArchivist(new XyoStorageArchivist({ type: 'page' }), 'page')
