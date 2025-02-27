import { ArchivistParams } from '@xyo-network/archivist-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { LmdbArchivistConfig } from './Config.ts'

export type LmdbArchivistParams = ArchivistParams<AnyConfigSchema<LmdbArchivistConfig>, {

}>
