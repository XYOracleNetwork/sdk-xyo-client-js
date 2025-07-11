import type { ArchivistParams } from '@xyo-network/archivist-model'
import type { AnyConfigSchema } from '@xyo-network/module-model'

import type { LevelDbArchivistConfig } from './Config.ts'

export interface LevelDbArchivistParams extends ArchivistParams<AnyConfigSchema<LevelDbArchivistConfig>> {

}
