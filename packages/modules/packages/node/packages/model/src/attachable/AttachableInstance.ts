import { IsObjectFactory, TypeCheck } from '@xylabs/object'
import { AttachableModuleInstance } from '@xyo-network/module-model'

import { NodeConfig } from '../Config'
import { NodeInstance, NodeModule, NodeModuleEventData } from '../Node'

export interface AttachableNodeInstance<TConfig extends NodeConfig = NodeConfig, TEventData extends NodeModuleEventData = NodeModuleEventData>
  extends NodeModule<TConfig, TEventData>,
    AttachableModuleInstance<TConfig, TEventData>,
    NodeInstance<TConfig, TEventData> {}

export type AttachableNodeInstanceTypeCheck<T extends AttachableNodeInstance = AttachableNodeInstance> = TypeCheck<T>

export class IsAttachableNodeInstanceFactory<T extends AttachableNodeInstance = AttachableNodeInstance> extends IsObjectFactory<T> {}
