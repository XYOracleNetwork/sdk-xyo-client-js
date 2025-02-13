import type { ArchivistParams } from '@xyo-network/archivist-model'
import type { AnyConfigSchema } from '@xyo-network/module-model'

import type { LmdbArchivistConfig } from './Config.ts'

export type LmdbArchivistParams = ArchivistParams<AnyConfigSchema<LmdbArchivistConfig>, {

}>
