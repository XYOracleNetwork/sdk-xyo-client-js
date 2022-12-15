import { PartialModuleConfig } from '@xyo-network/module'

import { ArchivistConfig } from './Config'

export type PartialArchivistConfig<T extends ArchivistConfig> = PartialModuleConfig<T>
