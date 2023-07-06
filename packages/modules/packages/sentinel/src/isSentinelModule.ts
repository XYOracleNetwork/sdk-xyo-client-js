import { isModule, IsModuleFactory } from '@xyo-network/module'

import { SentinelModule } from './SentinelModel'

export const isSentinelModule = IsModuleFactory.create<SentinelModule>(isModule, ['report'])
