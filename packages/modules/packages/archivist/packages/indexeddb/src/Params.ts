import type { ArchivistParams } from '@xyo-network/archivist-model'
import type { AnyConfigSchema } from '@xyo-network/module-model'

import type { IndexedDbArchivistConfig } from './Config.ts'

export type IndexedDbArchivistParams = ArchivistParams<AnyConfigSchema<IndexedDbArchivistConfig>>
