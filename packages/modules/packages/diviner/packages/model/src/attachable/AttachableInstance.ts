import { IsObjectFactory, TypeCheck } from '@xylabs/object'
import { AnyConfigSchema, AttachableModuleInstance } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { DivinerConfig } from '../Config'
import { DivinerModuleEventData } from '../EventData'
import { DivinerInstance } from '../Instance'

export interface AttachableDivinerInstance<
  TConfig extends AnyConfigSchema<DivinerConfig> = AnyConfigSchema<DivinerConfig>,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData = DivinerModuleEventData,
> extends DivinerInstance<TConfig, TIn, TOut, TEventData>,
    AttachableModuleInstance<TConfig, TEventData> {}

export type AttachableDivinerInstanceTypeCheck<T extends AttachableDivinerInstance = AttachableDivinerInstance> = TypeCheck<T>

export class IsAttachableDivinerInstanceFactory<T extends AttachableDivinerInstance = AttachableDivinerInstance> extends IsObjectFactory<T> {}
