import { ArchivePathParams } from '@xyo-network/node-core-model'

export type ArchiveSchemaPayloadsRecentPathParams = ArchivePathParams & {
  limit?: string
  schema: string
}
