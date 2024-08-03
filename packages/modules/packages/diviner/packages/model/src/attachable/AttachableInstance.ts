import { IsObjectFactory, TypeCheck } from '@xylabs/object'
import { AttachableModuleInstance } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { DivinerModuleEventData } from '../EventData.ts'
import { DivinerInstance } from '../Instance.ts'
import { DivinerParams } from '../Params.ts'

export interface AttachableDivinerInstance<
  TParams extends DivinerParams = DivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData = DivinerModuleEventData,
> extends DivinerInstance<TParams, TIn, TOut, TEventData>,
  AttachableModuleInstance<TParams, TEventData> {}

export type AttachableDivinerInstanceTypeCheck<T extends AttachableDivinerInstance = AttachableDivinerInstance> = TypeCheck<T>

export class IsAttachableDivinerInstanceFactory<T extends AttachableDivinerInstance = AttachableDivinerInstance> extends IsObjectFactory<T> {}
