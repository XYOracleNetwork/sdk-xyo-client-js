import type { TypeCheck } from '@xylabs/sdk-js'
import { IsObjectFactory } from '@xylabs/sdk-js'
import type { AttachableModuleInstance } from '@xyo-network/module-model'

import type { NodeInstance } from '../instance.ts'
import type { NodeModule, NodeModuleEventData } from '../Node.ts'
import type { NodeParams } from '../Params.ts'

export interface AttachableNodeInstance<TParams extends NodeParams = NodeParams, TEventData extends NodeModuleEventData = NodeModuleEventData>
  extends NodeModule<TParams, TEventData>,
  AttachableModuleInstance<TParams, TEventData>,
  NodeInstance<TParams, TEventData> {}

export type AttachableNodeInstanceTypeCheck<T extends AttachableNodeInstance = AttachableNodeInstance> = TypeCheck<T>

export class IsAttachableNodeInstanceFactory<T extends AttachableNodeInstance = AttachableNodeInstance> extends IsObjectFactory<T> {}
