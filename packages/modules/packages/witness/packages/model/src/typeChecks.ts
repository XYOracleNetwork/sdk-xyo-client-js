import { AsFactory, IsInstanceFactory, IsModuleFactory, isModuleInstance, WithFactory } from '@xyo-network/module-model'

import { WitnessInstance, WitnessModule } from './Module'
import { WitnessObserveQuerySchema } from './Queries'

export const isWitnessInstance = IsInstanceFactory.create<WitnessInstance>({ observe: 'function' }, isModuleInstance)
export const isWitnessModule = IsModuleFactory.create<WitnessModule>([WitnessObserveQuerySchema])

export const asWitnessModule = AsFactory.create(isWitnessModule)
export const asWitnessInstance = AsFactory.create(isWitnessInstance)
export const withWitnessModule = WithFactory.create(isWitnessModule)
export const withWitnessInstance = WithFactory.create(isWitnessInstance)
