import { IsObjectFactory, TypeCheck } from '@xylabs/object'
import { AnyConfigSchema, AttachableModuleInstance } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { WitnessConfig } from '../Config'
import { WitnessModuleEventData } from '../EventData'
import { WitnessInstance } from '../Instance'

export interface AttachableWitnessInstance<
  TConfig extends AnyConfigSchema<WitnessConfig> = AnyConfigSchema<WitnessConfig>,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEventData extends WitnessModuleEventData = WitnessModuleEventData,
> extends WitnessInstance<TConfig, TIn, TOut, TEventData>,
    AttachableModuleInstance<TConfig, TEventData> {}

export type AttachableWitnessInstanceTypeCheck<T extends AttachableWitnessInstance = AttachableWitnessInstance> = TypeCheck<T>

export class IsAttachableWitnessInstanceFactory<T extends AttachableWitnessInstance = AttachableWitnessInstance> extends IsObjectFactory<T> {}
