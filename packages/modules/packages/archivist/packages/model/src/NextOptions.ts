import type { Hex } from '@xylabs/sdk-js'
import type { Sequence } from '@xyo-network/payload-model'

export interface NextOptions<TSequence = Hex> {
  cursor?: TSequence
  limit?: number
  open?: boolean
  order?: 'asc' | 'desc'
}

export interface ArchivistNextOptions extends NextOptions<Sequence> {}
