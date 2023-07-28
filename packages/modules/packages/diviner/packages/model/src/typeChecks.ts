import { IsInstanceFactory, IsModuleFactory, isModuleInstance, WithFactory } from '@xyo-network/module-model'
import { AsObjectFactory } from '@xyo-network/object-identity'

import { DivinerInstance } from './Instance'
import { DivinerModule } from './Module'
import { DivinerDivineQuerySchema } from './Queries'

export const isDivinerInstance = new IsInstanceFactory<DivinerInstance>().create({ divine: 'function' }, [isModuleInstance])
export const isDivinerModule = new IsModuleFactory<DivinerModule>().create([DivinerDivineQuerySchema])

export const asDivinerModule = AsObjectFactory.create(isDivinerModule)
export const asDivinerInstance = AsObjectFactory.create(isDivinerInstance)
export const withDivinerModule = WithFactory.create(isDivinerModule)
export const withDivinerInstance = WithFactory.create(isDivinerInstance)
