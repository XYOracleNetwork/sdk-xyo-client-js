import type { TypeCheck } from '@xylabs/object'
import { IsObjectFactory } from '@xylabs/object'
import type { AttachableModuleInstance } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

import type { WitnessModuleEventData } from '../EventData.ts'
import type { WitnessInstance } from '../Instance.ts'
import type { WitnessParams } from '../Params.ts'

export type AttachableWitnessInstance<
  TParams extends WitnessParams = WitnessParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEventData extends WitnessModuleEventData = WitnessModuleEventData,
> = WitnessInstance<TParams, TIn, TOut, TEventData> &
  AttachableModuleInstance<TParams, TEventData>

export type AttachableWitnessInstanceTypeCheck<T extends AttachableWitnessInstance = AttachableWitnessInstance> = TypeCheck<T>

export class IsAttachableWitnessInstanceFactory<T extends AttachableWitnessInstance = AttachableWitnessInstance> extends IsObjectFactory<T> {}
