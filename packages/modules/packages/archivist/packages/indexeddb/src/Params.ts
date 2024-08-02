import { ArchivistParams } from '@xyo-network/archivist-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { IndexedDbArchivistConfig } from './Config.ts'

export type IndexedDbArchivistParams = ArchivistParams<AnyConfigSchema<IndexedDbArchivistConfig>>
