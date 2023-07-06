import { IsInstanceFactory } from '@xyo-network/module'

import { WitnessInstance } from './Witness'

export const isWitnessInstance = IsInstanceFactory.create<WitnessInstance>({ observe: 'function' })
