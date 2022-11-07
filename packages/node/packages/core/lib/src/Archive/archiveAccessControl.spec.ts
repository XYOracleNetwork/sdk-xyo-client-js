import 'jest-extended'

import { ArchivePermissionsArchivist } from '@xyo-network/node-core-model'
import { mock, MockProxy } from 'jest-mock-extended'

import { setArchiveAccessPrivate, setArchiveAccessPublic } from './archiveAccessControl'

describe('archiveAccessControl', () => {
  describe('setArchiveAccessPublic', () => {
    const archivist: MockProxy<ArchivePermissionsArchivist> = mock<ArchivePermissionsArchivist>()
    it('sets permissions to public', async () => {
      await setArchiveAccessPublic(archivist, 'foo')
      expect(archivist.insert).toHaveBeenCalledOnce()
    })
  })
  describe('setArchiveAccessPrivate', () => {
    const archivist: MockProxy<ArchivePermissionsArchivist> = mock<ArchivePermissionsArchivist>()
    it('sets permissions to private', async () => {
      await setArchiveAccessPrivate(archivist, 'foo')
      expect(archivist.insert).toHaveBeenCalledOnce()
    })
  })
})
