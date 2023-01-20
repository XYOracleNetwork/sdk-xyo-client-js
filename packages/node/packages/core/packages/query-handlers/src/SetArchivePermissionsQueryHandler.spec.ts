import {
  ArchivePermissionsArchivistFactory,
  DebugSchema,
  SetArchivePermissionsPayloadWithMeta,
  SetArchivePermissionsQuery,
  SetArchivePermissionsSchema,
} from '@xyo-network/node-core-model'
import { mock, MockProxy } from 'jest-mock-extended'

import { SetArchivePermissionsQueryHandler } from './SetArchivePermissionsQueryHandler'

const _archive = 'test'
const _hash = '1234567890'
const _timestamp = Date.now()
const allowedAddress = '0x8ba1f109551bd432803012645ac136ddd64dba72'
const disallowedAddress = '0x0ac1df02185025f65202660f8167210a80dd5086'
const allowedSchema = 'network.xyo.test'
const disallowedSchema = DebugSchema
const _queryId = '0'

const getQueryPayload = (
  allowedAddresses: string[] = [allowedAddress],
  disallowedAddresses: string[] = [disallowedAddress],
  allowedSchemas: string[] = [allowedSchema],
  disallowedSchemas: string[] = [disallowedSchema],
): SetArchivePermissionsPayloadWithMeta => {
  return {
    _archive,
    _hash,
    _queryId,
    _timestamp,
    addresses: {
      allow: allowedAddresses,
      reject: disallowedAddresses,
    },
    schema: SetArchivePermissionsSchema,
    schemas: {
      allow: allowedSchemas,
      reject: disallowedSchemas,
    },
  }
}

describe('SetArchivePermissionsQueryHandler', () => {
  describe('handle', () => {
    let archivist: MockProxy<ArchivePermissionsArchivistFactory>
    let sut: SetArchivePermissionsQueryHandler
    beforeEach(() => {
      archivist = mock<ArchivePermissionsArchivistFactory>()
      sut = new SetArchivePermissionsQueryHandler(archivist)
    })
    describe('with invalid permissions', () => {
      it('detects missing archive', async () => {
        const payload: Partial<SetArchivePermissionsPayloadWithMeta> = getQueryPayload()
        delete payload._archive
        const query = new SetArchivePermissionsQuery({ ...payload } as SetArchivePermissionsPayloadWithMeta)
        await expect(sut.handle(query)).rejects.toThrow()
      })
      it('detects duplicate address in allow/reject', async () => {
        const payload = getQueryPayload([allowedAddress], [allowedAddress], [allowedSchema], [disallowedSchema])
        const query = new SetArchivePermissionsQuery({ ...payload })
        await expect(sut.handle(query)).rejects.toThrow()
      })
      it('detects duplicate schema in allow/reject', async () => {
        const payload = getQueryPayload([allowedAddress], [disallowedAddress], [allowedSchema], [allowedSchema])
        const query = new SetArchivePermissionsQuery({ ...payload })
        await expect(sut.handle(query)).rejects.toThrow()
      })
    })
  })
})
