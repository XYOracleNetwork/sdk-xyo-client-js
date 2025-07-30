import type { StateDictionary } from '@xyo-network/module-model'
import type { Sequence } from '@xyo-network/payload-model'

export type IndexingDivinerState = StateDictionary & {
  cursor: Sequence
}
