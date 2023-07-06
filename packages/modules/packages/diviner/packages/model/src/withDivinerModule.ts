import { WithModuleFactory } from '@xyo-network/module-model'

import { isDivinerModule } from './isDivinerModule'

export const withDivinerModule = WithModuleFactory.create(isDivinerModule)
