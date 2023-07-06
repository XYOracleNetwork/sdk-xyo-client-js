import { IsModuleFactory } from '@xyo-network/module'

import { WitnessModule } from './Module'
import { WitnessObserveQuerySchema } from './Queries'

export const isWitnessModule = IsModuleFactory.create<WitnessModule>([WitnessObserveQuerySchema])
