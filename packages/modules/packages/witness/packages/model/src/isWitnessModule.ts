import { isModule, IsModuleFactory } from '@xyo-network/module'

import { WitnessModule } from './Module'

export const isWitnessModule = IsModuleFactory.create<WitnessModule>(isModule, ['observe'])
