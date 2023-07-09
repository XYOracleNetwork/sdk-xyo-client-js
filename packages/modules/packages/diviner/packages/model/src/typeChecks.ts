import { AsFactory, IsInstanceFactory, IsModuleFactory, isModuleInstance, WithFactory } from '@xyo-network/module-model'

import { DivinerInstance, DivinerModule } from './Diviner'
import { DivinerDivineQuerySchema } from './Queries'

export const isDivinerInstance = IsInstanceFactory.create<DivinerInstance>({ divine: 'function' }, isModuleInstance)
export const isDivinerModule = IsModuleFactory.create<DivinerModule>([DivinerDivineQuerySchema])

export const asDivinerModule = AsFactory.create(isDivinerModule)
export const asDivinerInstance = AsFactory.create(isDivinerInstance)
export const withDivinerModule = WithFactory.create(isDivinerModule)
export const withDivinerInstance = WithFactory.create(isDivinerInstance)
