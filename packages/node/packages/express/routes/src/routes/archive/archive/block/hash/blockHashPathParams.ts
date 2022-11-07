import { ArchivePathParams } from '@xyo-network/node-core-model'

export type BlockHashPathParams = ArchivePathParams & {
  hash: string
}
