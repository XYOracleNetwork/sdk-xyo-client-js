import { PartialModuleConfig } from '@xyo-network/module'

import { XyoArchivistConfig } from './Config'

export type PartialArchivistConfig<T extends XyoArchivistConfig> = PartialModuleConfig<T>
