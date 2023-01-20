import { ArchivePathParams } from '@xyo-network/node-core-model'

export type PayloadChainPathParams = ArchivePathParams & {
  hash: string
  limit?: string
}
