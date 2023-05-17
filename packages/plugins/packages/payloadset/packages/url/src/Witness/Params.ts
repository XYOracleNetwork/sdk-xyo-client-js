import { AnyConfigSchema } from '@xyo-network/module'
import { WitnessParams } from '@xyo-network/witness'

import { UrlWitnessConfig } from './Config'

export type UrlWitnessParams = WitnessParams<AnyConfigSchema<UrlWitnessConfig>>
