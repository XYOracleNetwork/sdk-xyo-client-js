import { IsObjectFactory, TypeCheck } from '@xylabs/object'
import { AttachableModuleInstance } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { WitnessModuleEventData } from '../EventData'
import { WitnessInstance } from '../Instance'
import { WitnessParams } from '../Params'

export interface AttachableWitnessInstance<
  TParams extends WitnessParams = WitnessParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEventData extends WitnessModuleEventData = WitnessModuleEventData,
> extends WitnessInstance<TParams, TIn, TOut, TEventData>,
    AttachableModuleInstance<TParams, TEventData> {}

export type AttachableWitnessInstanceTypeCheck<T extends AttachableWitnessInstance = AttachableWitnessInstance> = TypeCheck<T>

export class IsAttachableWitnessInstanceFactory<T extends AttachableWitnessInstance = AttachableWitnessInstance> extends IsObjectFactory<T> {}
