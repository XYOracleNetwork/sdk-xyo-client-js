import { ArchivistParams } from '@xyo-network/archivist-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { LevelDbArchivistConfig } from './Config.ts'

export type LevelDbArchivistParams = ArchivistParams<AnyConfigSchema<LevelDbArchivistConfig>, {

}>
