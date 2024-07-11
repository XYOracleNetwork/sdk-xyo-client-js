import { AsObjectFactory } from '@xylabs/object'
import { IsInstanceFactory, IsModuleFactory, isModuleInstance, WithFactory } from '@xyo-network/module-model'

import { DivinerInstance } from './Instance.js'
import { DivinerModule } from './Module.js'
import { DivinerDivineQuerySchema } from './Queries/index.js'

export const isDivinerInstance = new IsInstanceFactory<DivinerInstance>().create({ divine: 'function' }, [isModuleInstance])
export const isDivinerModule = new IsModuleFactory<DivinerModule>().create([DivinerDivineQuerySchema])

export const asDivinerModule = AsObjectFactory.create(isDivinerModule)
export const asDivinerInstance = AsObjectFactory.create(isDivinerInstance)
export const withDivinerModule = WithFactory.create(isDivinerModule)
export const withDivinerInstance = WithFactory.create(isDivinerInstance)
