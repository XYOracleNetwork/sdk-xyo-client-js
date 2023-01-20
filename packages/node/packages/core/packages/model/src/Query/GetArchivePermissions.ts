import { XyoPayloadWithMeta } from '../Payload'
import { Query } from './Query'

export type GetArchivePermissionsSchema = 'network.xyo.security.archive.permissions.get'
export const GetArchivePermissionsSchema: GetArchivePermissionsSchema = 'network.xyo.security.archive.permissions.get'

export interface GetArchivePermissions {
  schema: GetArchivePermissionsSchema
}

export type GetArchivePermissionsPayload = XyoPayloadWithMeta<GetArchivePermissions>

export class GetArchivePermissionsQuery extends Query<GetArchivePermissionsPayload> {}
