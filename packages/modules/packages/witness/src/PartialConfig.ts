import { PartialModuleConfig } from '@xyo-network/module'

import { XyoWitnessConfig } from './Config'

export type PartialWitnessConfig<T extends XyoWitnessConfig> = PartialModuleConfig<
  Omit<T, 'targetSchema'> & {
    targetSchema?: T['targetSchema']
  }
>
