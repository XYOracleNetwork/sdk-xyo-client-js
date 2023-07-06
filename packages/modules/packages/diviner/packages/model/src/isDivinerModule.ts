import { isModule, IsModuleFactory } from '@xyo-network/module'

import { DivinerModule } from './Diviner'

export const isDivinerModule = IsModuleFactory.create<DivinerModule>(isModule, ['divine'])
