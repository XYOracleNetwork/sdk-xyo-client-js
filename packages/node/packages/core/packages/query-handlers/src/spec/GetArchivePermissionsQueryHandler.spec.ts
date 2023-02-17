import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import {
  ArchivePermissionsArchivist,
  ArchivePermissionsArchivistFactory,
  DebugSchema,
  GetArchivePermissionsQuery,
  GetArchivePermissionsSchema,
  SetArchivePermissionsPayload,
  SetArchivePermissionsSchema,
  XyoPayloadWithMeta,
} from '@xyo-network/node-core-model'
import { mock, MockProxy } from 'jest-mock-extended'

import { GetArchivePermissionsQueryHandler } from '../GetArchivePermissionsQueryHandler'

const schema = GetArchivePermissionsSchema
const _archive = 'test'
const _hash = '1234567890'
const _timestamp = Date.now()
const emptyPermissions: SetArchivePermissionsPayload = {
  schema: 'network.xyo.security.archive.permissions.set',
}
const permissions: SetArchivePermissionsPayload = {
  addresses: {
    allow: ['0x8ba1f109551bd432803012645ac136ddd64dba72'],
    reject: ['0x0ac1df02185025f65202660f8167210a80dd5086'],
  },
  schema: SetArchivePermissionsSchema,
  schemas: {
    allow: ['network.xyo.test'],
    reject: [DebugSchema],
  },
}

const expectEmptyPermissions = (actual: XyoPayloadWithMeta<SetArchivePermissionsPayload>) => {
  expect(actual).toBeTruthy()
  expect(actual?.schema).toBe(SetArchivePermissionsSchema)
  expect(actual?.addresses).toBeUndefined()
  expect(actual?.schemas).toBeUndefined()
}

const configureAsNotWrapped = (archivist: MockProxy<ArchivePermissionsArchivist>) => {
  ;(archivist as unknown as { module: false }).module = false
  return archivist
}

describe('GetArchivePermissionsQueryHandler', () => {
  describe('handle', () => {
    const archivist = configureAsNotWrapped(mock<ArchivePermissionsArchivist>())
    const archivistFactory: MockProxy<ArchivePermissionsArchivistFactory> = jest.fn().mockResolvedValue(archivist)
    const sut = new GetArchivePermissionsQueryHandler(archivistFactory)
    describe('when permissions for the archive', () => {
      describe('exist', () => {
        beforeEach(() => {
          const payloads: SetArchivePermissionsPayload[] = [permissions, emptyPermissions]
          const [boundWitness] = new BoundWitnessBuilder().payloads(payloads).build()
          archivist.query.mockResolvedValueOnce([boundWitness, payloads])
        })
        it('returns the latest archive permissions', async () => {
          const actual = await sut.handle(new GetArchivePermissionsQuery({ _archive, _hash, _timestamp, schema }))
          expect(actual).toBeTruthy()
          expect(actual?.schema).toBe(SetArchivePermissionsSchema)
          expect(actual?.addresses).toBeDefined()
          expect(actual?.addresses?.allow).toBeDefined()
          expect(Array.isArray(actual?.addresses?.allow)).toBeTruthy()
          expect(actual?.addresses?.reject).toBeDefined()
          expect(Array.isArray(actual?.addresses?.reject)).toBeTruthy()
          expect(actual?.schemas).toBeDefined()
          expect(actual?.schemas?.allow).toBeDefined()
          expect(Array.isArray(actual?.schemas?.allow)).toBeTruthy()
          expect(actual?.schemas?.reject).toBeDefined()
          expect(Array.isArray(actual?.schemas?.reject)).toBeTruthy()
        })
      })
    })
    describe('do not exist', () => {
      beforeEach(() => {
        const [boundWitness] = new BoundWitnessBuilder().build()
        archivist.query.mockResolvedValueOnce([boundWitness, []])
      })
      it('returns the empty permissions', async () => {
        const actual = await sut.handle(new GetArchivePermissionsQuery({ _archive, _hash, _timestamp, schema }))
        expectEmptyPermissions(actual)
      })
    })
    describe('when archive not supplied', () => {
      beforeEach(() => {
        const [boundWitness] = new BoundWitnessBuilder().build()
        archivist.query.mockResolvedValueOnce([boundWitness, []])
      })
      it('throws', async () => {
        const query = new GetArchivePermissionsQuery({ _hash, _timestamp, schema })
        await expect(sut.handle(query)).rejects.toThrow()
      })
    })
  })
})
