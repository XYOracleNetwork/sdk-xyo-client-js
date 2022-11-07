import { ArchivePathParams } from '@xyo-network/node-core-model'

export type BlockChainPathParams = ArchivePathParams & {
  address: string
  hash: string
  limit?: string
}
