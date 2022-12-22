import { XyoPayload } from '@xyo-network/payload-model'

import { ArchivePermissions } from '../Domain'
import { Query } from './Query'
import { XyoQueryPayloadWithMeta } from './XyoQueryPayloadWithMeta'

export type SetArchivePermissionsSchema = 'network.xyo.security.archive.permissions.set'
export const SetArchivePermissionsSchema: SetArchivePermissionsSchema = 'network.xyo.security.archive.permissions.set'

export interface SetArchivePermissions {
  addresses?: ArchivePermissions
  schema: SetArchivePermissionsSchema
  schemas?: ArchivePermissions
}

export type SetArchivePermissionsPayloadWithMeta = XyoQueryPayloadWithMeta<SetArchivePermissions>
export type SetArchivePermissionsPayload = XyoPayload<SetArchivePermissions>

export class SetArchivePermissionsQuery extends Query<SetArchivePermissionsPayload> {}

export const publicArchivePermissions: SetArchivePermissionsPayload = {
  schema: SetArchivePermissionsSchema,
}

export const privateArchivePermissions: SetArchivePermissionsPayload = {
  addresses: {
    allow: [],
  },
  schema: SetArchivePermissionsSchema,
}
