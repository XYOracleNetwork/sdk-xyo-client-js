import { ModuleInstance } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { WitnessModule } from './Module'
import { WitnessParams } from './Params'
import { Witness } from './Witness'

export type WitnessInstance<
  TParams extends WitnessParams = WitnessParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
> = WitnessModule<TParams> & Witness<TIn, TOut> & ModuleInstance
