import { IsObjectFactory, TypeCheck } from '@xylabs/object'
import { AttachableModuleInstance } from '@xyo-network/module-model'

import { NodeInstance } from '../instance.ts'
import { NodeModule, NodeModuleEventData } from '../Node.ts'
import { NodeParams } from '../Params.ts'

export interface AttachableNodeInstance<TParams extends NodeParams = NodeParams, TEventData extends NodeModuleEventData = NodeModuleEventData>
  extends NodeModule<TParams, TEventData>,
    AttachableModuleInstance<TParams, TEventData>,
    NodeInstance<TParams, TEventData> {}

export type AttachableNodeInstanceTypeCheck<T extends AttachableNodeInstance = AttachableNodeInstance> = TypeCheck<T>

export class IsAttachableNodeInstanceFactory<T extends AttachableNodeInstance = AttachableNodeInstance> extends IsObjectFactory<T> {}
