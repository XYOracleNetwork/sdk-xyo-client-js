import type { TypeCheck } from '@xylabs/sdk-js'
import { IsObjectFactory } from '@xylabs/sdk-js'
import type { AttachableModuleInstance } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

import type { DivinerModuleEventData } from '../EventData.ts'
import type { DivinerInstance } from '../Instance.ts'
import type { DivinerParams } from '../Params.ts'

export interface AttachableDivinerInstance<
  TParams extends DivinerParams = DivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData = DivinerModuleEventData,
> extends DivinerInstance<TParams, TIn, TOut, TEventData>,
  AttachableModuleInstance<TParams, TEventData> {}

export type AttachableDivinerInstanceTypeCheck<T extends AttachableDivinerInstance = AttachableDivinerInstance> = TypeCheck<T>

export class IsAttachableDivinerInstanceFactory<T extends AttachableDivinerInstance = AttachableDivinerInstance> extends IsObjectFactory<T> {}
