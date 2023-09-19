import { IsInstanceFactory, IsModuleFactory, isModuleInstance, WithFactory } from '@xyo-network/module-model'
import { AsObjectFactory } from '@xyo-network/object'

import { WitnessInstance } from './Instance'
import { WitnessModule } from './Module'
import { WitnessObserveQuerySchema } from './Queries'

export const isWitnessInstance = new IsInstanceFactory<WitnessInstance>().create({ observe: 'function' }, [isModuleInstance])
export const isWitnessModule = new IsModuleFactory<WitnessModule>().create([WitnessObserveQuerySchema])

export const asWitnessModule = AsObjectFactory.create(isWitnessModule)
export const asWitnessInstance = AsObjectFactory.create(isWitnessInstance)
export const withWitnessModule = WithFactory.create(isWitnessModule)
export const withWitnessInstance = WithFactory.create(isWitnessInstance)
