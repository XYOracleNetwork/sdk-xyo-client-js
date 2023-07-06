import { IsModuleFactory } from '@xyo-network/module'

import { DivinerModule } from './Diviner'
import { DivinerDivineQuerySchema } from './Queries'

export const isDivinerModule = IsModuleFactory.create<DivinerModule>([DivinerDivineQuerySchema])
